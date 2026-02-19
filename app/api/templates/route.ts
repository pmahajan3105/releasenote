import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/ssr"
import { cookies } from "next/headers"

// GET: List templates for user's organization
export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Get user's organization
    const { data: memberData, error: memberError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", session.user.id)
      .single()
    if (memberError || !memberData) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }
    const { data: templates, error: templatesError } = await supabase
      .from("templates")
      .select("*")
      .eq("organization_id", memberData.organization_id)
      .order("created_at", { ascending: false })
    if (templatesError) throw templatesError
    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error("Templates fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

// POST: Create a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    // Get user's organization
    const { data: memberData, error: memberError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", session.user.id)
      .single()
    if (memberError || !memberData) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }
    const insertPayload = {
      ...body,
      organization_id: memberData.organization_id,
    }
    const { data, error } = await supabase
      .from("templates")
      .insert([insertPayload])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ template: data }, { status: 201 })
  } catch (error) {
    console.error("Template create error:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
