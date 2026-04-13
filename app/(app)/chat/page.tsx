import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server";
import { getFinancialSummary } from "@/lib/assistant/financialSummary";
import { getRecentMessages } from "@/lib/assistant/history";
import { ChatClient } from "./ChatClient";

export default async function ChatPage() {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let summary = null;
  let messages: Awaited<ReturnType<typeof getRecentMessages>> = [];
  let loadError: string | null = null;

  try {
    const [summaryResult, messagesResult] = await Promise.all([
      getFinancialSummary(user!.id),
      getRecentMessages(user!.id, 20),
    ]);
    summary = summaryResult;
    messages = messagesResult;
  } catch (err: any) {
    console.error("chat page load error", err);
    loadError = err?.message ?? "Unable to load assistant data.";
  }

  const snapshot = summary
    ? {
        netWorth: summary.netWorth,
        monthlyIncome: summary.monthlyIncome,
        monthlyExpenses: summary.monthlyExpenses,
        savingsRate: summary.savingsRate,
        totalDebt: summary.totalDebt,
        activeLoans: summary.activeLoans.length,
        goalsOnTrack: summary.goals.filter((g) => g.status === "on_track").length,
        goalsOffTrack: summary.goals.filter((g) => g.status === "off_track").length,
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about your finances, goals, and budget. Context is synced from your latest data.
        </p>
        {loadError && (
          <p className="text-sm text-destructive">
            {loadError} Please check your Supabase tables and try again.
          </p>
        )}
      </div>
      <ChatClient initialMessages={messages} initialSnapshot={snapshot} />
    </div>
  );
}

