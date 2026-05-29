import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET() {
  return Response.json({
    ok: true,
    message: "API Chat funcionando 🚀 (Gemini)",
    keyExists: !!process.env.GEMINI_API_KEY,
  });
}

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];
    const system = body.system || "";

    // Gemini usa history separado da mensagem atual
    const history = [];
    let lastUserMessage = "";

    for (const m of messages) {
      if (!m.content || m.content.trim() === "") continue;

      const role = m.role === "assistant" ? "model" : "user";

      // Guarda a última mensagem do user separada
      if (role === "user") {
        // Empurra a anterior pro history antes de sobrescrever
        if (lastUserMessage !== "") {
          // já foi adicionada no loop anterior
        }
        lastUserMessage = m.content;
        history.push({ role, parts: [{ text: m.content }] });
      } else {
        history.push({ role, parts: [{ text: m.content }] });
      }
    }

    // A última mensagem do user é enviada via sendMessage
    // Remove do history para não duplicar
    const lastMessage = history.pop();

    if (!lastMessage || lastMessage.role !== "user") {
      return Response.json(
        { error: "A última mensagem deve ser do usuário" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      ...(system && system.trim() !== ""
        ? { systemInstruction: system }
        : {}),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const text = result.response.text();

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
