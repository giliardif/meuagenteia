export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
