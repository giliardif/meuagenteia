export async function GET() {
  return Response.json({
    ok: true,
    message: "API Chat funcionando 🚀",
  });
}

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const messages = body.messages || [];
    const system = body.system || "";

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: system
            ? { parts: [{ text: system }] }
            : undefined,
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();

      return Response.json(
        {
          error: "Erro na API Gemini",
          details: err,
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui processar.";

    return Response.json({
      content: [
        {
          type: "text",
          text,
        },
      ],
    });
  } catch (error) {
    return Response.json(
      {
        error: "Erro interno",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
