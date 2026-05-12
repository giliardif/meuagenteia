export async function POST(req) {
  try {
    // 1. Validação da API KEY (EVITA ERRO SILENCIOSO)
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    // 2. Leitura segura do body
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];
    const system = body.system || "";

    // 3. Normalização das mensagens
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    // 4. Chamada para Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    // 5. Tratamento de erro da API externa
    if (!res.ok) {
      const err = await res.text();
      return Response.json(
        { error: "Erro na API Gemini", details: err },
        { status: res.status }
      );
    }

    // 6. Extração da resposta
    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui processar sua solicitação.";

    // 7. Resposta final padronizada
    return Response.json({
      content: [
        {
          type: "text",
          text,
        },
      ],
    });
  } catch (error) {
    // 8. Erro geral (runtime)
    return Response.json(
      {
        error: "Erro interno no servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
