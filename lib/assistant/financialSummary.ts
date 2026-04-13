import { createServerClient } from "@/lib/supabase/server";

export type FinancialSummary = {
  netWorth: number;
  totalBankBalance: number;
  totalInvestments: number;
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  avgExpenseLast3M: number;
  activeLoans: Array<{
    name: string;
    outstanding: number;
    emi: number;
    interestRate: number;
    tenureRemainingMonths: number;
  }>;
  goals: Array<{
    name: string;
    target: number;
    saved: number;
    status: "on_track" | "off_track";
    etaMonths: number | null;
  }>;
  assetsBreakdown: {
    bank: number;
    investments: number;
    realEstate: number;
    gold: number;
    other: number;
  };
};

function safeNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function getFinancialSummary(userId: string): Promise<FinancialSummary> {
  const supabase = createServerClient();

  // Accounts (bank balances)
  const { data: accounts } = await supabase
    .from("accounts")
    .select("balance, type")
    .eq("user_id", userId);

  const totalBankBalance = (accounts ?? []).reduce(
    (sum, acc) => sum + safeNumber(acc.balance ?? 0),
    0
  );

  // Investments
  const { data: investments } = await supabase
    .from("investments")
    .select("quantity, current_price, avg_price, investment_type")
    .eq("user_id", userId);

  const totalInvestments = (investments ?? []).reduce((sum, inv) => {
    const price = safeNumber(inv.current_price ?? inv.avg_price ?? 0);
    const qty = safeNumber(inv.quantity ?? 0);
    return sum + price * qty;
  }, 0);

  // Loans
  const { data: loans } = await supabase
    .from("loans")
    .select("loan_name, outstanding_amount, monthly_emi, interest_rate, remaining_months, status")
    .eq("user_id", userId);

  const activeLoans = (loans ?? [])
    .filter((l) => (l.status ?? "active").toLowerCase() === "active")
    .map((l) => ({
      name: l.loan_name ?? "Loan",
      outstanding: safeNumber(l.outstanding_amount),
      emi: safeNumber(l.monthly_emi),
      interestRate: safeNumber(l.interest_rate),
      tenureRemainingMonths: Math.max(0, Math.round(safeNumber(l.remaining_months))),
    }));

  const totalDebt = activeLoans.reduce((sum, l) => sum + l.outstanding, 0);

  // Assets breakdown (non-bank/investments)
  const { data: assets } = await supabase
    .from("assets")
    .select("type, current_value, purchase_price")
    .eq("user_id", userId);

  let realEstate = 0;
  let gold = 0;
  let otherAssets = 0;
  for (const a of assets ?? []) {
    const value = safeNumber(a.current_value ?? a.purchase_price ?? 0);
    const t = (a.type ?? "").toLowerCase();
    if (t.includes("real")) realEstate += value;
    else if (t.includes("gold")) gold += value;
    else otherAssets += value;
  }

  // Transactions for last 90 days (income/expenses)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const { data: txns } = await supabase
    .from("transactions")
    .select("amount, date")
    .eq("user_id", userId)
    .gte("date", ninetyDaysAgo.toISOString().slice(0, 10));

  let incomeSum = 0;
  let expenseSum = 0;
  for (const t of txns ?? []) {
    const amt = safeNumber(t.amount);
    if (amt < 0) {
      incomeSum += Math.abs(amt);
    } else {
      expenseSum += amt;
    }
  }

  // Normalize to monthly (90 days ~ 3 months)
  const monthlyIncome = incomeSum / 3;
  const monthlyExpenses = expenseSum / 3;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
  const avgExpenseLast3M = expenseSum / 3;

  // Goals
  const { data: goals } = await supabase
    .from("goals")
    .select("name, target_amount, saved_amount, status, monthly_sip_required")
    .eq("user_id", userId);

  const goalsSummaries =
    goals?.map((g) => {
      const remaining = Math.max(0, safeNumber(g.target_amount) - safeNumber(g.saved_amount));
      const sip = Math.max(0, safeNumber((g as any).monthly_sip_required));
      const eta =
        sip > 0 ? Math.ceil(remaining / sip) : null;
      const status = ((g.status as string) ?? "on_track").toLowerCase() === "off_track" ? "off_track" : "on_track";
      return {
        name: g.name ?? "Goal",
        target: safeNumber(g.target_amount),
        saved: safeNumber(g.saved_amount),
        status,
        etaMonths: eta,
      };
    }) ?? [];

  const netWorth = totalBankBalance + totalInvestments + realEstate + gold + otherAssets - totalDebt;

  return {
    netWorth,
    totalBankBalance,
    totalInvestments,
    totalDebt,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    avgExpenseLast3M,
    activeLoans,
    goals: goalsSummaries,
    assetsBreakdown: {
      bank: totalBankBalance,
      investments: totalInvestments,
      realEstate,
      gold,
      other: otherAssets,
    },
  };
}

export function buildSystemPromptFromSummary(summary: FinancialSummary, userName?: string): string {
  const {
    netWorth,
    totalBankBalance,
    totalInvestments,
    totalDebt,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    avgExpenseLast3M,
    activeLoans,
    goals,
    assetsBreakdown,
  } = summary;

  const nameLine = userName ? `You are assisting ${userName}.` : "You are assisting a user.";

  const loansText =
    activeLoans.length === 0
      ? "No active loans recorded."
      : activeLoans
          .map(
            (l) =>
              `${l.name} – outstanding ₹${l.outstanding.toFixed(
                0
              )}, EMI ₹${l.emi.toFixed(0)}, interest ${l.interestRate.toFixed(
                2
              )}%, tenure remaining ${l.tenureRemainingMonths} months.`
          )
          .join("\n");

  const goalsText =
    goals.length === 0
      ? "No goals recorded."
      : goals
          .map(
            (g) =>
              `Goal "${g.name}" – target ₹${g.target.toFixed(0)}, saved ₹${g.saved.toFixed(
                0
              )}, status: ${g.status}, ETA: ${g.etaMonths ?? "unknown"} months.`
          )
          .join("\n");

  return [
    "You are FinanceAI, a helpful financial planning assistant for a user in India.",
    nameLine,
    "Use only the user's data and general personal finance principles. Do not give legal, tax, or SEBI-registered advice. Provide educational guidance, budgeting suggestions, and clear action steps.",
    "All numbers are approximate and based on Supabase data at the time of the request.",
    "",
    "Snapshot of the user's finances (INR):",
    `- Net worth: ₹${netWorth.toFixed(0)}`,
    `  • Bank accounts: ₹${totalBankBalance.toFixed(0)}`,
    `  • Investments: ₹${totalInvestments.toFixed(0)}`,
    `  • Real estate: ₹${assetsBreakdown.realEstate.toFixed(0)}`,
    `  • Gold: ₹${assetsBreakdown.gold.toFixed(0)}`,
    `  • Other assets: ₹${assetsBreakdown.other.toFixed(0)}`,
    `- Total debt: ₹${totalDebt.toFixed(0)}, across ${activeLoans.length} active loans/credit lines.`,
    `- Monthly income (approx last 3 months): ₹${monthlyIncome.toFixed(0)}`,
    `- Monthly expenses (approx last 3 months): ₹${monthlyExpenses.toFixed(0)}`,
    `- Savings rate: ${savingsRate.toFixed(1)}%`,
    `- Average monthly expense (last 3 months): ₹${avgExpenseLast3M.toFixed(0)}`,
    "",
    "Active loans:",
    loansText,
    "",
    "Goals:",
    goalsText,
    "",
    "Guidelines:",
    "- Reference the user's numbers when giving suggestions.",
    "- Focus on budgeting, emergency fund, debt payoff order, and goal planning.",
    "- If data is missing, say so and provide a general guideline instead.",
    '- If asked outside personal finance, say it is outside scope or answer briefly.',
    '- If unsure, say "I am not fully sure" and note what data is needed.',
    "",
    "Definitions:",
    "- Income: positive inflows from salary or other sources (approximated from transactions).",
    "- Expenses: outflows/spending (approximated from transactions).",
  ].join("\n");
}

