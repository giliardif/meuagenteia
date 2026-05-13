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

    // 3. Normalização das mensagens para o formato do Gemini
    // Filtra mensagens vazias e garante que as roles sejam 'user' ou 'model'
    const contents = messages
      .filter((m) => m.content && m.content.trim() !== "")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // 4. Chamada para a API do Gemini
    // Usando gemini-1.5-flash-latest para evitar erro 404 e ter mais cota que o 2.0
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
            temperature: 0.7,
          },
        }),
      }
    );

    // Log de monitoramento no dashboard da Vercel
    console.log("Gemini status:", res.status);

    // 5. Tratamento de Erros da API
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
          message: errorData?.error?.message || "Erro na comunicação com o Google",
          details: errorData,
        },
        { status: res.status }
      );
    }

    // 6. Processamento da Resposta com Sucesso
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "O modelo não retornou um conteúdo válido.";

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
