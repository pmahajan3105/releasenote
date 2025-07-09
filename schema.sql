

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."apply_css_customization"("org_id" "uuid", "css_content" "text", "css_vars" "jsonb", "user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  history_id UUID;
BEGIN
  -- Deactivate current customization
  UPDATE css_customization_history 
  SET is_active = FALSE 
  WHERE organization_id = org_id AND is_active = TRUE;
  
  -- Insert new customization
  INSERT INTO css_customization_history (
    organization_id, 
    custom_css, 
    css_variables, 
    applied_by,
    is_active
  ) VALUES (
    org_id, 
    css_content, 
    css_vars, 
    user_id,
    TRUE
  ) RETURNING id INTO history_id;
  
  -- Update organization
  UPDATE organizations 
  SET 
    custom_css = css_content,
    custom_css_enabled = TRUE,
    updated_at = NOW()
  WHERE id = org_id;
  
  RETURN history_id;
END;
$$;


ALTER FUNCTION "public"."apply_css_customization"("org_id" "uuid", "css_content" "text", "css_vars" "jsonb", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_save_release_note"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only create version if content actually changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.content_markdown IS DISTINCT FROM NEW.content_markdown OR
    OLD.content_html IS DISTINCT FROM NEW.content_html OR
    OLD.content_json IS DISTINCT FROM NEW.content_json
  )) THEN
    -- Create auto-save version
    PERFORM create_release_note_version(
      NEW.id,
      NEW.title,
      NEW.content,
      NEW.content_markdown,
      NEW.content_html,
      NEW.content_json,
      'Auto-save',
      true
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_save_release_note"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clean_expired_oauth_states"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."clean_expired_oauth_states"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_ssl_challenges"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM ssl_challenges 
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_ssl_challenges"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_auto_saves"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  WITH ranked_versions AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY release_note_id ORDER BY created_at DESC) as rn
    FROM release_note_versions
    WHERE is_auto_save = true
  )
  DELETE FROM release_note_versions
  WHERE id IN (
    SELECT id FROM ranked_versions WHERE rn > 10
  );
END;
$$;


ALTER FUNCTION "public"."cleanup_old_auto_saves"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_release_note_version"("p_release_note_id" "uuid", "p_title" "text", "p_content" "text" DEFAULT NULL::"text", "p_content_markdown" "text" DEFAULT NULL::"text", "p_content_html" "text" DEFAULT NULL::"text", "p_content_json" "jsonb" DEFAULT NULL::"jsonb", "p_change_summary" "text" DEFAULT NULL::"text", "p_is_auto_save" boolean DEFAULT false) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM release_note_versions
  WHERE release_note_id = p_release_note_id;

  -- Insert new version
  INSERT INTO release_note_versions (
    release_note_id,
    version_number,
    title,
    content,
    content_markdown,
    content_html,
    content_json,
    created_by,
    change_summary,
    is_auto_save
  ) VALUES (
    p_release_note_id,
    v_version_number,
    p_title,
    p_content,
    p_content_markdown,
    p_content_html,
    p_content_json,
    auth.uid(),
    p_change_summary,
    p_is_auto_save
  ) RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$;


ALTER FUNCTION "public"."create_release_note_version"("p_release_note_id" "uuid", "p_title" "text", "p_content" "text", "p_content_markdown" "text", "p_content_html" "text", "p_content_json" "jsonb", "p_change_summary" "text", "p_is_auto_save" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_publishing_action"("p_release_note_id" "uuid", "p_action" "text", "p_scheduled_for" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_notes" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_history_id UUID;
BEGIN
  INSERT INTO release_note_publishing_history (
    release_note_id,
    action,
    performed_by,
    scheduled_for,
    notes,
    metadata
  ) VALUES (
    p_release_note_id,
    p_action,
    auth.uid(),
    p_scheduled_for,
    p_notes,
    p_metadata
  ) RETURNING id INTO v_history_id;

  RETURN v_history_id;
END;
$$;


ALTER FUNCTION "public"."log_publishing_action"("p_release_note_id" "uuid", "p_action" "text", "p_scheduled_for" timestamp with time zone, "p_notes" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ssl_certificates_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ssl_certificates_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_context" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "system_prompt" "text" NOT NULL,
    "user_prompt_template" "text" NOT NULL,
    "example_output" "text",
    "tone" "text",
    "audience" "text",
    "output_format" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_context" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."css_customization_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "custom_css" "text",
    "css_variables" "jsonb",
    "applied_by" "uuid",
    "applied_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT false
);


ALTER TABLE "public"."css_customization_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."css_themes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'custom'::"text",
    "css_variables" "jsonb" NOT NULL,
    "custom_css" "text",
    "preview_image_url" "text",
    "is_public" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."css_themes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."domain_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "domain" "text" NOT NULL,
    "verification_token" "text" NOT NULL,
    "verification_method" "text" DEFAULT 'dns'::"text",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."domain_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "external_id" "text" NOT NULL,
    "encrypted_credentials" "jsonb" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "integrations_type_check" CHECK (("type" = ANY (ARRAY['github'::"text", 'jira'::"text", 'linear'::"text"])))
);


ALTER TABLE "public"."integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."oauth_states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "state" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."oauth_states" OWNER TO "postgres";


COMMENT ON TABLE "public"."oauth_states" IS 'Stores OAuth state parameters for security validation during OAuth flows';



CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "logo_url" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "custom_domain" "text",
    "domain_verified" boolean DEFAULT false,
    "meta_title" "text",
    "meta_description" "text",
    "meta_image_url" "text",
    "favicon_url" "text",
    "brand_color" "text" DEFAULT '#7F56D9'::"text",
    "custom_css" "text",
    "custom_css_enabled" boolean DEFAULT false
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ssl_certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "domain" "text" NOT NULL,
    "certificate" "text" NOT NULL,
    "private_key" "text" NOT NULL,
    "certificate_chain" "text",
    "expires_at" timestamp with time zone NOT NULL,
    "auto_renew" boolean DEFAULT true,
    "provider" "text" DEFAULT 'letsencrypt'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ssl_certificates" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."organization_ssl_status" AS
 SELECT "o"."id",
    "o"."name",
    "o"."custom_domain",
    "o"."domain_verified",
        CASE
            WHEN (("sc"."id" IS NOT NULL) AND ("sc"."expires_at" > "now"())) THEN true
            ELSE false
        END AS "ssl_enabled",
        CASE
            WHEN ("sc"."id" IS NULL) THEN 'no_certificate'::"text"
            WHEN ("sc"."expires_at" <= "now"()) THEN 'expired'::"text"
            WHEN ("sc"."expires_at" <= ("now"() + '30 days'::interval)) THEN 'expiring_soon'::"text"
            ELSE 'active'::"text"
        END AS "ssl_status",
    "sc"."expires_at" AS "ssl_expires_at",
    "sc"."auto_renew" AS "ssl_auto_renew",
    "sc"."provider" AS "ssl_provider"
   FROM ("public"."organizations" "o"
     LEFT JOIN "public"."ssl_certificates" "sc" ON ((("o"."id" = "sc"."organization_id") AND ("o"."custom_domain" = "sc"."domain"))));


ALTER VIEW "public"."organization_ssl_status" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."query_performance_monitor" AS
 SELECT "schemaname",
    "relname" AS "table_name",
    "indexrelname" AS "index_name",
    "idx_scan",
    "idx_tup_read",
    "idx_tup_fetch"
   FROM "pg_stat_user_indexes"
  WHERE ("idx_scan" > 0)
  ORDER BY "idx_scan" DESC;


ALTER VIEW "public"."query_performance_monitor" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."release_note_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#7F56D9'::"text",
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."release_note_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."release_note_collaborators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "release_note_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'editor'::"text",
    "added_by" "uuid",
    CONSTRAINT "release_note_collaborators_role_check" CHECK (("role" = ANY (ARRAY['editor'::"text", 'reviewer'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."release_note_collaborators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."release_note_publishing_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "release_note_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "performed_by" "uuid",
    "scheduled_for" timestamp with time zone,
    "notes" "text",
    "metadata" "jsonb",
    CONSTRAINT "release_note_publishing_history_action_check" CHECK (("action" = ANY (ARRAY['draft_saved'::"text", 'scheduled'::"text", 'published'::"text", 'unpublished'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."release_note_publishing_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."release_note_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "release_note_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "content_markdown" "text",
    "content_html" "text",
    "content_json" "jsonb",
    "created_by" "uuid",
    "change_summary" "text",
    "is_auto_save" boolean DEFAULT false
);


ALTER TABLE "public"."release_note_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."release_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "integration_id" "uuid",
    "title" "text" NOT NULL,
    "version" "text",
    "slug" "text" NOT NULL,
    "content_markdown" "text" NOT NULL,
    "content_html" "text",
    "status" "text" NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "version_number" "text",
    "is_major_version" boolean DEFAULT false,
    "scheduled_at" timestamp with time zone,
    "published_by" "uuid",
    "content_json" "jsonb",
    "meta_title" "text",
    "meta_description" "text",
    "meta_image_url" "text",
    "tags" "text"[],
    "changelog" "jsonb"[],
    "content" "text",
    "og_title" "text",
    "og_description" "text",
    "twitter_title" "text",
    "twitter_description" "text",
    "is_public" boolean DEFAULT false,
    "category" "text",
    "featured_image_url" "text",
    "excerpt" "text",
    CONSTRAINT "release_notes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'scheduled'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."release_notes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."release_notes_with_stats" AS
 SELECT "rn"."id",
    "rn"."organization_id",
    "rn"."integration_id",
    "rn"."title",
    "rn"."version",
    "rn"."slug",
    "rn"."content_markdown",
    "rn"."content_html",
    "rn"."status",
    "rn"."published_at" AS "publish_date",
    "rn"."created_at",
    "rn"."updated_at",
    "rn"."version_number",
    "rn"."is_major_version",
    "rn"."scheduled_at",
    "rn"."published_by",
    "rn"."content_json",
    "rn"."meta_title",
    "rn"."meta_description",
    "rn"."meta_image_url",
    "rn"."tags",
    "rn"."changelog",
    "rv"."latest_version",
    "rv"."total_versions",
    "rph"."last_published_at",
    "rph"."last_action",
    COALESCE("rc"."collaborator_count", (0)::bigint) AS "collaborator_count"
   FROM ((("public"."release_notes" "rn"
     LEFT JOIN ( SELECT "release_note_versions"."release_note_id",
            "max"("release_note_versions"."version_number") AS "latest_version",
            "count"(*) AS "total_versions"
           FROM "public"."release_note_versions"
          GROUP BY "release_note_versions"."release_note_id") "rv" ON (("rv"."release_note_id" = "rn"."id")))
     LEFT JOIN ( SELECT "release_note_publishing_history"."release_note_id",
            "max"("release_note_publishing_history"."created_at") FILTER (WHERE ("release_note_publishing_history"."action" = 'published'::"text")) AS "last_published_at",
            ("array_agg"("release_note_publishing_history"."action" ORDER BY "release_note_publishing_history"."created_at" DESC))[1] AS "last_action"
           FROM "public"."release_note_publishing_history"
          GROUP BY "release_note_publishing_history"."release_note_id") "rph" ON (("rph"."release_note_id" = "rn"."id")))
     LEFT JOIN ( SELECT "release_note_collaborators"."release_note_id",
            "count"(*) AS "collaborator_count"
           FROM "public"."release_note_collaborators"
          GROUP BY "release_note_collaborators"."release_note_id") "rc" ON (("rc"."release_note_id" = "rn"."id")));


ALTER VIEW "public"."release_notes_with_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ssl_challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "domain" "text" NOT NULL,
    "challenge_type" "text" DEFAULT 'dns-01'::"text",
    "challenge_token" "text" NOT NULL,
    "challenge_response" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "verified_at" timestamp with time zone
);


ALTER TABLE "public"."ssl_challenges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscribers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscribers_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'unsubscribed'::"text"])))
);


ALTER TABLE "public"."subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_cache" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "integration_id" "uuid" NOT NULL,
    "external_ticket_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text",
    "type" "text",
    "labels" "jsonb" DEFAULT '[]'::"jsonb",
    "url" "text",
    "completed_at" timestamp with time zone,
    "fetched_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ticket_cache" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_context"
    ADD CONSTRAINT "ai_context_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."css_customization_history"
    ADD CONSTRAINT "css_customization_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."css_themes"
    ADD CONSTRAINT "css_themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."domain_verifications"
    ADD CONSTRAINT "domain_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_org_id_type_external_id_key" UNIQUE ("organization_id", "type", "external_id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oauth_states"
    ADD CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oauth_states"
    ADD CONSTRAINT "oauth_states_state_key" UNIQUE ("state");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."release_note_categories"
    ADD CONSTRAINT "release_note_categories_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."release_note_categories"
    ADD CONSTRAINT "release_note_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."release_note_collaborators"
    ADD CONSTRAINT "release_note_collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."release_note_collaborators"
    ADD CONSTRAINT "release_note_collaborators_release_note_id_user_id_key" UNIQUE ("release_note_id", "user_id");



ALTER TABLE ONLY "public"."release_note_publishing_history"
    ADD CONSTRAINT "release_note_publishing_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."release_note_versions"
    ADD CONSTRAINT "release_note_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."release_note_versions"
    ADD CONSTRAINT "release_note_versions_release_note_id_version_number_key" UNIQUE ("release_note_id", "version_number");



ALTER TABLE ONLY "public"."release_notes"
    ADD CONSTRAINT "release_notes_org_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."release_notes"
    ADD CONSTRAINT "release_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ssl_certificates"
    ADD CONSTRAINT "ssl_certificates_organization_id_domain_key" UNIQUE ("organization_id", "domain");



ALTER TABLE ONLY "public"."ssl_certificates"
    ADD CONSTRAINT "ssl_certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ssl_challenges"
    ADD CONSTRAINT "ssl_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_org_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_cache"
    ADD CONSTRAINT "ticket_cache_integration_id_external_ticket_id_key" UNIQUE ("integration_id", "external_ticket_id");



ALTER TABLE ONLY "public"."ticket_cache"
    ADD CONSTRAINT "ticket_cache_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "ai_context_organization_id_idx" ON "public"."ai_context" USING "btree" ("organization_id");



CREATE INDEX "idx_css_customization_history_active" ON "public"."css_customization_history" USING "btree" ("organization_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_css_customization_history_org" ON "public"."css_customization_history" USING "btree" ("organization_id");



CREATE INDEX "idx_css_themes_category" ON "public"."css_themes" USING "btree" ("category");



CREATE INDEX "idx_css_themes_public" ON "public"."css_themes" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_domain_verifications_domain" ON "public"."domain_verifications" USING "btree" ("domain");



CREATE INDEX "idx_integrations_org_id" ON "public"."integrations" USING "btree" ("organization_id");



CREATE INDEX "idx_oauth_states_expires_at" ON "public"."oauth_states" USING "btree" ("expires_at");



CREATE INDEX "idx_oauth_states_provider" ON "public"."oauth_states" USING "btree" ("provider");



CREATE INDEX "idx_oauth_states_state" ON "public"."oauth_states" USING "btree" ("state");



CREATE INDEX "idx_oauth_states_user_id" ON "public"."oauth_states" USING "btree" ("user_id");



CREATE INDEX "idx_organization_members_organization_id" ON "public"."organization_members" USING "btree" ("organization_id");



CREATE INDEX "idx_organization_members_user_id" ON "public"."organization_members" USING "btree" ("user_id");



CREATE INDEX "idx_organizations_custom_domain" ON "public"."organizations" USING "btree" ("custom_domain") WHERE ("custom_domain" IS NOT NULL);



CREATE INDEX "idx_release_notes_category" ON "public"."release_notes" USING "btree" ("category");



CREATE INDEX "idx_release_notes_integration_id" ON "public"."release_notes" USING "btree" ("integration_id");



CREATE INDEX "idx_release_notes_org_id" ON "public"."release_notes" USING "btree" ("organization_id");



CREATE INDEX "idx_release_notes_org_status_published" ON "public"."release_notes" USING "btree" ("organization_id", "status", "published_at" DESC) WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_release_notes_org_version" ON "public"."release_notes" USING "btree" ("organization_id", "version_number") WHERE ("version_number" IS NOT NULL);



CREATE INDEX "idx_release_notes_search" ON "public"."release_notes" USING "btree" ("title", "content_html");



CREATE INDEX "idx_release_notes_tags" ON "public"."release_notes" USING "gin" ("tags");



CREATE INDEX "idx_ssl_certificates_expires_at" ON "public"."ssl_certificates" USING "btree" ("expires_at") WHERE ("auto_renew" = true);



CREATE INDEX "idx_ssl_certificates_org_domain" ON "public"."ssl_certificates" USING "btree" ("organization_id", "domain");



CREATE INDEX "idx_ssl_challenges_domain_status" ON "public"."ssl_challenges" USING "btree" ("domain", "status");



CREATE INDEX "idx_ssl_challenges_expires_at" ON "public"."ssl_challenges" USING "btree" ("expires_at");



CREATE INDEX "idx_subscribers_org_id" ON "public"."subscribers" USING "btree" ("organization_id");



CREATE INDEX "idx_ticket_cache_integration_id" ON "public"."ticket_cache" USING "btree" ("integration_id");



CREATE INDEX "integrations_organization_id_type_idx" ON "public"."integrations" USING "btree" ("organization_id", "type");



CREATE INDEX "release_note_collaborators_release_note_id_idx" ON "public"."release_note_collaborators" USING "btree" ("release_note_id");



CREATE INDEX "release_note_collaborators_user_id_idx" ON "public"."release_note_collaborators" USING "btree" ("user_id");



CREATE INDEX "release_note_publishing_history_action_idx" ON "public"."release_note_publishing_history" USING "btree" ("action");



CREATE INDEX "release_note_publishing_history_release_note_id_idx" ON "public"."release_note_publishing_history" USING "btree" ("release_note_id");



CREATE INDEX "release_note_versions_release_note_id_idx" ON "public"."release_note_versions" USING "btree" ("release_note_id");



CREATE INDEX "release_note_versions_version_number_idx" ON "public"."release_note_versions" USING "btree" ("release_note_id", "version_number");



CREATE INDEX "release_notes_scheduled_at_idx" ON "public"."release_notes" USING "btree" ("scheduled_at") WHERE ("scheduled_at" IS NOT NULL);



CREATE INDEX "release_notes_tags_idx" ON "public"."release_notes" USING "gin" ("tags");



CREATE INDEX "release_notes_version_number_idx" ON "public"."release_notes" USING "btree" ("organization_id", "version_number");



CREATE OR REPLACE TRIGGER "release_note_auto_version" AFTER UPDATE ON "public"."release_notes" FOR EACH ROW EXECUTE FUNCTION "public"."auto_save_release_note"();



CREATE OR REPLACE TRIGGER "update_css_themes_updated_at" BEFORE UPDATE ON "public"."css_themes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_domain_verifications_updated_at" BEFORE UPDATE ON "public"."domain_verifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_integrations_updated_at" BEFORE UPDATE ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_release_note_categories_updated_at" BEFORE UPDATE ON "public"."release_note_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_release_notes_updated_at" BEFORE UPDATE ON "public"."release_notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ssl_certificates_updated_at" BEFORE UPDATE ON "public"."ssl_certificates" FOR EACH ROW EXECUTE FUNCTION "public"."update_ssl_certificates_updated_at"();



ALTER TABLE ONLY "public"."ai_context"
    ADD CONSTRAINT "ai_context_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."css_customization_history"
    ADD CONSTRAINT "css_customization_history_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."css_customization_history"
    ADD CONSTRAINT "css_customization_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."css_themes"
    ADD CONSTRAINT "css_themes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."domain_verifications"
    ADD CONSTRAINT "domain_verifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_org_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."oauth_states"
    ADD CONSTRAINT "oauth_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_note_categories"
    ADD CONSTRAINT "release_note_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_note_collaborators"
    ADD CONSTRAINT "release_note_collaborators_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."release_note_collaborators"
    ADD CONSTRAINT "release_note_collaborators_release_note_id_fkey" FOREIGN KEY ("release_note_id") REFERENCES "public"."release_notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_note_collaborators"
    ADD CONSTRAINT "release_note_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_note_publishing_history"
    ADD CONSTRAINT "release_note_publishing_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."release_note_publishing_history"
    ADD CONSTRAINT "release_note_publishing_history_release_note_id_fkey" FOREIGN KEY ("release_note_id") REFERENCES "public"."release_notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_note_versions"
    ADD CONSTRAINT "release_note_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."release_note_versions"
    ADD CONSTRAINT "release_note_versions_release_note_id_fkey" FOREIGN KEY ("release_note_id") REFERENCES "public"."release_notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_notes"
    ADD CONSTRAINT "release_notes_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."release_notes"
    ADD CONSTRAINT "release_notes_org_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."release_notes"
    ADD CONSTRAINT "release_notes_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ssl_certificates"
    ADD CONSTRAINT "ssl_certificates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ssl_challenges"
    ADD CONSTRAINT "ssl_challenges_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_org_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_cache"
    ADD CONSTRAINT "ticket_cache_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view public CSS themes" ON "public"."css_themes" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can access their own oauth states" ON "public"."oauth_states" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create CSS themes" ON "public"."css_themes" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can delete their own CSS themes" ON "public"."css_themes" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can manage CSS history for their organization" ON "public"."css_customization_history" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Users can manage SSL certificates for their organization" ON "public"."ssl_certificates" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Users can manage SSL challenges for their organization" ON "public"."ssl_challenges" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Users can manage categories for their organization" ON "public"."release_note_categories" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text"]))))));



CREATE POLICY "Users can manage their own domain verifications" ON "public"."domain_verifications" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Users can update their own CSS themes" ON "public"."css_themes" FOR UPDATE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can view CSS history for their organization" ON "public"."css_customization_history" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view SSL certificates for their organization" ON "public"."ssl_certificates" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view SSL challenges for their organization" ON "public"."ssl_challenges" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view categories for their organization" ON "public"."release_note_categories" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own CSS themes" ON "public"."css_themes" FOR SELECT USING (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."css_customization_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."css_themes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."domain_verifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "integrations_policy" ON "public"."integrations" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."oauth_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organization_members_policy" ON "public"."organization_members" USING (("organization_id" IN ( SELECT "organization_members_1"."organization_id"
   FROM "public"."organization_members" "organization_members_1"
  WHERE ("organization_members_1"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_policy" ON "public"."organizations" USING (("id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."release_note_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."release_note_collaborators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."release_note_publishing_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."release_note_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."release_notes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "release_notes_policy" ON "public"."release_notes" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."ssl_certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ssl_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscribers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscribers_policy" ON "public"."subscribers" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."ticket_cache" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ticket_cache_policy" ON "public"."ticket_cache" USING (("integration_id" IN ( SELECT "i"."id"
   FROM ("public"."integrations" "i"
     JOIN "public"."organization_members" "om" ON (("i"."organization_id" = "om"."organization_id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;








































































































































































GRANT SELECT ON TABLE "public"."organization_ssl_status" TO "authenticated";

































RESET ALL;
