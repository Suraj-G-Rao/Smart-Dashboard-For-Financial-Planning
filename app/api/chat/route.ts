import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerComponentClient } from "@/lib/supabase/server";
import { buildSystemPromptFromSummary, getFinancialSummary } from "@/lib/assistant/financialSummary";
import { getRecentMessages, saveMessage } from "@/lib/assistant/history";
import { callGroqChat, type ChatMessage } from "@/lib/assistant/groqClient";

const inputSchema = z.object({
  input: z.string().min(1).max(2000),
});

export async function GET() {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [summary, messages] = await Promise.all([
    getFinancialSummary(user.id),
    getRecentMessages(user.id, 30),
  ]);

  return NextResponse.json({
    messages,
    summarySnapshot: {
      netWorth: summary.netWorth,
      monthlyIncome: summary.monthlyIncome,
      monthlyExpenses: summary.monthlyExpenses,
      savingsRate: summary.savingsRate,
      totalDebt: summary.totalDebt,
      activeLoans: summary.activeLoans.length,
      goalsOnTrack: summary.goals.filter((g) => g.status === "on_track").length,
      goalsOffTrack: summary.goals.filter((g) => g.status === "off_track").length,
    },
  });
}

export async function POST(req: Request) {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: string;
  try {
    const body = await req.json();
    ({ input } = inputSchema.parse(body));
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid request", details: err?.message }, { status: 400 });
  }

  try {
    const summary = await getFinancialSummary(user.id);
    const systemPrompt = buildSystemPromptFromSummary(
      summary,
      (user.user_metadata as any)?.full_name ?? undefined
    );
    const history = await getRecentMessages(user.id, 30);

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: input },
    ];

    // Persist user message
    await saveMessage(user.id, "user", input);

    const answer = await callGroqChat(messages);

    // Persist assistant message
    await saveMessage(user.id, "assistant", answer);

    return NextResponse.json({
      answer,
      summarySnapshot: {
        netWorth: summary.netWorth,
        monthlyIncome: summary.monthlyIncome,
        monthlyExpenses: summary.monthlyExpenses,
        savingsRate: summary.savingsRate,
        totalDebt: summary.totalDebt,
        activeLoans: summary.activeLoans.length,
        goalsOnTrack: summary.goals.filter((g) => g.status === "on_track").length,
        goalsOffTrack: summary.goals.filter((g) => g.status === "off_track").length,
      },
    });
  } catch (err: any) {
    console.error("chat route error", err);
    return NextResponse.json(
      { error: "Chat failed", details: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

