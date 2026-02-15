import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { data: memberData, error: memberError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", session.user.id)
      .single();
    const organizationId =
      memberData && typeof memberData === "object" && "organization_id" in memberData
        ? (memberData as { organization_id?: string }).organization_id
        : undefined;
    if (memberError || !organizationId) {
      return NextResponse.json({ error: "AI context not configured" }, { status: 400 });
    }

    const { data: aiContext, error: contextError } = await supabase
      .from("ai_context")
      .select("*")
      .eq("organization_id", organizationId)
      .single();
    if (contextError || !aiContext) {
      return NextResponse.json({ error: "AI context not configured" }, { status: 400 });
    }
    // Build prompt using AI context and user-provided data
    const { tickets = [], title = "", description = "" } = body;
    // Compose the prompt
    let prompt = `${aiContext.system_prompt}\n`;
    prompt += `\n${aiContext.user_prompt_template}\n`;
    prompt += `\nRelease Title: ${title}`;
    if (description) prompt += `\nDescription: ${description}`;
    if (aiContext.tone) prompt += `\nTone: ${aiContext.tone}`;
    if (aiContext.audience) prompt += `\nAudience: ${aiContext.audience}`;
    if (aiContext.output_format) prompt += `\nOutput Format: ${aiContext.output_format}`;
    if (tickets.length > 0) {
      prompt += `\nTickets:\n`;
      for (const t of tickets) {
        prompt += `- ${typeof t === 'string' ? t : JSON.stringify(t)}\n`;
      }
    }
    if (aiContext.example_output) {
      prompt += `\nExample Output:\n${aiContext.example_output}`;
    }
    // Call OpenAI (or other LLM) using the composed prompt
    // This is a placeholder for the actual call
    const fakeAIResponse = `Generated release notes based on prompt:\n---\n${prompt}`;
    return NextResponse.json({ content: fakeAIResponse });
    // For real streaming:
    // const response = await openai.createChatCompletion({ ... })
    // return StreamingTextResponse(OpenAIStream(response));
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json({ error: "Failed to generate release notes" }, { status: 500 });
  }
}
