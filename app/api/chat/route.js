export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    // Monta o histórico no formato do Gemini
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 1000 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: "Erro na API Gemini", details: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui processar.";

    // Retorna no mesmo formato que o frontend espera
    return Response.json({ content: [{ type: "text", text }] });
  } catch (error) {
    return Response.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
