import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { deleteChatById } from "@/db/queries";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a Crypto Research Assistant specializing in:
- Deep analysis of blockchain protocols and tokens
- Market trends and metrics
- Token economics and governance
- Protocol comparisons and evaluations
- Technical analysis and on-chain data
- Regulatory developments and impact

Provide structured, data-driven insights similar to Messari's research style.
Focus on quantitative metrics, market dynamics, and fundamental analysis.`,
      },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    await deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred", { status: 500 });
  }
}
