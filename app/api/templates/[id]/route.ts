import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/ssr"
import { cookies } from "next/headers"

// PUT: Update a template
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const { data, error } = await supabase
      .from("templates")
      .update(body)
      .eq("id", id)
      .eq("organization_id", memberData.organization_id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ template: data })
  } catch (error) {
    console.error("Template update error:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

// DELETE: Delete a template
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id)
      .eq("organization_id", memberData.organization_id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Template delete error:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
