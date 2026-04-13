"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Snapshot = {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  totalDebt: number;
  activeLoans: number;
  goalsOnTrack: number;
  goalsOffTrack: number;
};

type Props = {
  initialMessages: ChatMessage[];
  initialSnapshot: Snapshot | null;
};

export function ChatClient({ initialMessages, initialSnapshot }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(initialSnapshot);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = input.trim().length > 0 && !loading;

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", { method: "GET" });
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setMessages(data.messages ?? []);
      setSnapshot(data.summarySnapshot ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    setError(null);
    const optimistic: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, optimistic]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: content }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Request failed");
      }
      const data = await res.json();
      if (data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      }
      if (data.summarySnapshot) {
        setSnapshot(data.summarySnapshot);
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const snapshotItems = useMemo(() => {
    if (!snapshot) return [];
    return [
      { label: "Net worth", value: snapshot.netWorth },
      { label: "Monthly income", value: snapshot.monthlyIncome },
      { label: "Monthly expenses", value: snapshot.monthlyExpenses },
      { label: "Savings rate", value: snapshot.savingsRate, suffix: "%" },
      { label: "Total debt", value: snapshot.totalDebt },
      { label: "Active loans", value: snapshot.activeLoans },
      { label: "Goals on track", value: snapshot.goalsOnTrack },
      { label: "Goals off track", value: snapshot.goalsOffTrack },
    ];
  }, [snapshot]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Assistant
            </div>
            <p className="text-xs text-muted-foreground">
              Ask questions about your finances, goals, and budget.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadHistory} disabled={loading}>
            <RotateCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
          </Button>
        </div>

        <div className="flex h-[65vh] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-border"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-xs bg-muted text-muted-foreground shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-300" />
                  <span className="ml-1">Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 pb-2 text-xs text-destructive">{error}</div>
          )}

          <div className="border-t px-4 py-3">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ask anything like "How much can I safely invest each month?"'
                className="min-h-[56px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button size="icon" disabled={!canSend} onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-background shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Your snapshot</p>
            <p className="text-xs text-muted-foreground">
              Context synced from your FinanceAI data.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {snapshotItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border bg-muted/40 px-3 py-2 text-sm"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-base font-semibold">
                {item.value?.toLocaleString?.("en-IN", {
                  maximumFractionDigits: 1,
                }) ?? item.value}
                {item.suffix ? ` ${item.suffix}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

