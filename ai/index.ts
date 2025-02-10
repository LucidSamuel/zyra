import OpenAI from "openai";
import { wrapLanguageModel } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Only export OpenAI model for now
export const openAIModel = wrapLanguageModel({
  model: openai.chat.completions.create,
});
