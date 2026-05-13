export async function GET() {
  return Response.json({
    ok: true,
    message: "API Chat funcionando 🚀",
    keyExists: !!process.env.GEMINI_API_KEY,
  });
}

export async function POST(req) {
  try {
    // 1. Validação da API KEY
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    // 2. Leitura do corpo da requisição
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];
    const system = body.system || "";

    // 3. Normalização das mensagens
    const contents = messages
      .filter((m) => m.content && m.content.trim() !== "")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    if (contents.length === 0) {
      return Response.json({ error: "Nenhuma mensagem válida enviada" }, { status: 400 });
    }

    // 4. Chamada para a API (MUDAMOS PARA v1 - VERSÃO ESTÁVEL)
    // A v1 é mais garantida para o modelo gemini-1.5-flash
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Nota: v1 pode não suportar system_instruction da mesma forma que a vbeta em alguns casos.
          // Se der erro de instrução, moveremos o 'system' para a primeira mensagem do 'contents'.
          system_instruction: system
            ? { parts: [{ text: system }] }
            : undefined,
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    console.log("Gemini status:", res.status);

    // 5. Tratamento de Erros
    if (!res.ok) {
      const errorData = await res.json().catch(async () => {
        const text = await res.text();
        return { raw: text };
      });

      console.error("GEMINI ERROR FULL:", errorData);

      return Response.json(
        {
          error: "Erro na API Gemini",
          status: errorData?.error?.status || "UNKNOWN",
          message: errorData?.error?.message || "Erro de conexão",
          details: errorData,
        },
        { status: res.status }
      );
    }

    // 6. Resposta com Sucesso
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "O modelo não retornou uma resposta.";

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
        error: "Erro interno no servidor Vercel",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
