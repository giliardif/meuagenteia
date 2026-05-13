export async function GET() {
  return Response.json({
    ok: true,
    message: "API Chat funcionando 🚀",
    keyExists: !!process.env.GEMINI_API_KEY,
    // Removido slice para evitar vazamento acidental em logs, apenas confirma existência
  });
}

export async function POST(req) {
  try {
    // 1. Valida API KEY
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    // 2. Lê body
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];
    const system = body.system || "";

    // 3. Normaliza mensagens para Gemini (Filtra mensagens vazias e ajusta roles)
    const contents = messages
      .filter((m) => m.content && m.content.trim() !== "")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // 4. Chamada Gemini (MODELO TROCADO PARA 1.5-FLASH PARA MAIOR COTA)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
            temperature: 0.7, // Adicionado para respostas mais naturais
          },
        }),
      }
    );

    console.log("Gemini status:", res.status);

    // 5. Erro Gemini
    if (!res.ok) {
      const errorData = await res.json().catch(async () => {
        const text = await res.text();
        return { raw: text };
      });

      console.log("GEMINI ERROR FULL:", errorData);

      return Response.json(
        {
          error: "Erro na API Gemini",
          status: errorData?.error?.status || "unknown",
          message: errorData?.error?.message || "Erro de cota ou conexão",
        },
        { status: res.status }
      );
    }

    // 6. Resposta válida
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "O modelo não retornou uma resposta válida.";

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
        error: "Erro interno no servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
