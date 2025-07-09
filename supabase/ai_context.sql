-- SQL for creating the ai_context table in Supabase
create table if not exists ai_context (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  system_prompt text not null,
  user_prompt_template text not null,
  example_output text,
  tone text,
  audience text,
  output_format text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraint to ensure one context per org
create unique index if not exists ai_context_organization_id_idx on ai_context(organization_id);
