"use client";

import React from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { CoPilotChat } from "@/src/components/CoPilotChat";

export function CoPilotChatRoot() {
  const supabase = createSupabaseClient();

  const functionsBaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
      : "";

  if (!functionsBaseUrl) {
    // If not configured, dont render the chat to avoid runtime errors
    return null;
  }

  return (
    <CoPilotChat
      supabase={supabase}
      functionsBaseUrl={functionsBaseUrl}
      panelWidth={400}
    />
  );
}
