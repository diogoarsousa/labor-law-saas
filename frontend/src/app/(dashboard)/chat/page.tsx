import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "Consulta Jurídica IA",
};

export default function ChatPage() {
  return (
    <DashboardShell
      title="Consulta Jurídica com IA"
      description="Faça perguntas sobre Direito do Trabalho português ao nosso assistente jurídico."
    >
      <ChatInterface />
    </DashboardShell>
  );
}
