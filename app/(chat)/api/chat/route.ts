import { convertToCoreMessages, Message, streamText } from "ai";
import { OpenAIStream } from "ai";
import { z } from "zod";

import { geminiProModel, openAIModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  const result = await streamText({
    model: openAIModel,
    system: `You are a Crypto Research Assistant that specializes in:
    - Deep analysis of blockchain protocols and tokens
    - Market trends and metrics
    - Token economics and governance
    - Protocol comparisons and evaluations
    - Technical analysis and on-chain data
    - Regulatory developments and impact
    
    Provide structured, data-driven insights similar to Messari's research style.
    Focus on quantitative metrics, market dynamics, and fundamental analysis.`,
    messages: coreMessages,
    tools: {
      analyzeToken: {
        description: "Analyze token metrics and fundamentals",
        parameters: z.object({
          token: z.string().describe("Token symbol or name"),
          metrics: z.array(
            z.enum([
              "price",
              "volume",
              "marketCap",
              "tokenomics",
              "governance",
              "onChainData",
              "development",
            ])
          ),
        }),
        execute: async ({ token, metrics }) => {
          try {
            const response = await fetch(
              `http://159.89.160.245:3000/deep-research/analyze?token=${token}&metrics=${metrics.join(
                ","
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch analysis");
            }

            return await response.json();
          } catch (error) {
            console.error("Analysis error:", error);
            return { error: "Failed to fetch analysis data" };
          }
        },
      },
      compareProtocols: {
        description: "Compare blockchain protocols or tokens",
        parameters: z.object({
          protocols: z
            .array(z.string())
            .describe("List of protocols to compare"),
          criteria: z.array(z.string()).describe("Comparison criteria"),
        }),
        execute: async ({ protocols, criteria }) => {
          return { comparison: {} }; // Implement comparison logic
        },
      },
      marketResearch: {
        description: "Get market research and trends",
        parameters: z.object({
          sector: z.string().describe("Crypto sector (DeFi, NFTs, L1s, etc.)"),
          timeframe: z.string().describe("Analysis timeframe"),
        }),
        execute: async ({ sector, timeframe }) => {
          return { insights: {} }; // Connect to market data source
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
