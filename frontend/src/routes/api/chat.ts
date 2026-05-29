import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `És o Doutor Trabalho, um assistente AI especialista em Direito do Trabalho em Portugal.
Respondes de forma clara, prática e empática, em português de Portugal.
Citas, sempre que possível, artigos do Código do Trabalho (Lei n.º 7/2009) e legislação complementar.
Avisas que as respostas são informativas e não substituem aconselhamento jurídico individual.
Usa markdown (títulos, listas, negrito) para organizar respostas longas.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages, model } = (await request.json()) as { messages: Msg[]; model?: string };
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const allowedModels = new Set([
            "google/gemini-3-flash-preview",
            "google/gemini-3-pro-preview",
            "openai/gpt-5.2",
          ]);
          const chosenModel = model && allowedModels.has(model) ? model : "google/gemini-3-flash-preview";

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: chosenModel,
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
              stream: true,
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Demasiados pedidos. Tente novamente em instantes." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "Créditos esgotados. Adicione fundos na sua workspace Lovable." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const text = await upstream.text();
            console.error("AI gateway error", upstream.status, text);
            return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error(e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
