export async function POST(req) {
  try {
    const body = await req.json();

    const messages = body.messages || [];
    const system = body.system || "";

    const contents = messages
      .filter(m => m.content?.trim())
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: system
            ? { parts: [{ text: system }] }
            : undefined,
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: "Erro na API Gemini",
          details: data
        },
        { status: response.status }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sem resposta";

    return Response.json({
      content: [
        {
          type: "text",
          text
        }
      ]
    });

  } catch (err) {
    return Response.json(
      {
        error: "Erro interno",
        details: err.message
      },
      { status: 500 }
    );
  }
}
