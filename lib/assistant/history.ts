import { createServerClient } from "@/lib/supabase/server";
import type { ChatMessage } from "./groqClient";

export async function getRecentMessages(
  userId: string,
  limit = 20
): Promise<ChatMessage[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("assistant_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getRecentMessages error", error);
    return [];
  }

  return (
    data?.map((row) => ({
      role: row.role as ChatMessage["role"],
      content: row.content,
    })) ?? []
  );
}

export async function saveMessage(
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("assistant_messages")
    .insert([{ user_id: userId, role, content }]);

  if (error) {
    console.error("saveMessage error", error);
  }
}

