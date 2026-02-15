import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// GET: Fetch AI context for user's organization
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
    const { data: aiContext, error: contextError } = await supabase
      .from("ai_context")
      .select("*")
      .eq("organization_id", memberData.organization_id)
      .single()
    if (contextError && contextError.code !== 'PGRST116') throw contextError // PGRST116: No rows found
    return NextResponse.json({ aiContext: aiContext || null })
  } catch (error) {
    console.error("AI context fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch AI context" }, { status: 500 })
  }
}

// POST: Create or update AI context for organization
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
    // Upsert (insert or update) AI context for this organization
    const upsertPayload = {
      ...body,
      organization_id: memberData.organization_id,
    }
    const { data, error } = await supabase
      .from("ai_context")
      .upsert([upsertPayload], { onConflict: "organization_id" })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ aiContext: data }, { status: 201 })
  } catch (error) {
    console.error("AI context upsert error:", error)
    return NextResponse.json({ error: "Failed to save AI context" }, { status: 500 })
  }
}
