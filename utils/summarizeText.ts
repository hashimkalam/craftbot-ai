const hfApiKey = process.env.HUGGING_FACE_API_TOKEN;

if (!hfApiKey) {
  throw new Error(
    "HUGGING_FACE_API_TOKEN is not defined in the environment variables"
  );
}

import { ScrapeConfig } from "@/types/types";
import { CohereClient } from "cohere-ai";

const cohereApiKey = process.env.COHERE_API_KEY;

if (!cohereApiKey) {
  throw new Error(
    "Oops! COHERE_API_KEY is missing in your environment variables."
  );
}
// Initialize the Cohere client
const cohere = new CohereClient({
  token: cohereApiKey,
});

// Configuration
const config: ScrapeConfig = {
  maxRetries: 3,
  timeout: 60000, // 60 seconds
  minContentLength: 10,
  maxParagraphs: 15,
};

export const summarizeText = async (
  text: string,
  retryCount = 0,
  noTokens?:number
): Promise<string> => {
  try {
    // Construct the prompt for summarization
    const prompt = [
      {
        role: "system",
        content:
          "You are a summarization assistant. Your task is to provide a concise summary of the provided content in under 100 words.",
      },
      {
        role: "user",
        content: text, // The text to be summarized
      },
    ];

    // Generate a response with Cohere
    const response = await cohere.generate({
      model: "command",
      prompt: prompt.map((p) => p.content).join("\n"),
      maxTokens: noTokens ? noTokens : 500,
    });

    // Ensure the response is valid
    if (
      !response.generations[0].text.trim() ||
      !response.generations[0].text.trim() ||
      response.generations[0].text.trim().length === 0
    ) {
      throw new Error("Invalid response from Cohere AI");
    }

    // Return the summary from the response
    return response.generations[0].text.trim(); // Ensure you trim any excess whitespace
  } catch (error) {
    if (retryCount < config.maxRetries) {
      console.log(`Retry ${retryCount + 1} for summarization...`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );
      return summarizeText(text, retryCount + 1);
    }
    throw error;
  }
};
