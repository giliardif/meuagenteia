import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  return Response.json({
    ok: true,
    message: "API Chat funcionando 🚀 (OpenAI)",
    keyExists: !!process.env.OPENAI_API_KEY,
  });
}

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];
    const system = body.system || "";

    // Converte seu formato para formato OpenAI
    const formattedMessages = [];

    // System prompt (OpenAI usa role: system)
    if (system && system.trim() !== "") {
      formattedMessages.push({
        role: "system",
        content: system,
      });
    }

    // Mensagens do chat
    for (const m of messages) {
      if (!m.content || m.content.trim() === "") continue;

      formattedMessages.push({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      });
    }

    if (formattedMessages.length === 0) {
      return Response.json(
        { error: "Nenhuma mensagem enviada" },
        { status: 400 }
      );
    }

    // CHAMADA GPT
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text =
      completion?.choices?.[0]?.message?.content || "Sem resposta.";

    return Response.json({
      content: [
        {
          type: "text",
          text,
        },
      ],
    });
  } catch (error) {
    console.error("API CHAT ERROR:", error);

    return Response.json(
      {
        error: "Erro interno",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
