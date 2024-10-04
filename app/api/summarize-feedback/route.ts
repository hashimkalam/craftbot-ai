import { NextRequest, NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohereApiKey = process.env.COHERE_API_KEY;

if (!cohereApiKey) {
  throw new Error("COHERE_API_KEY is not defined in the environment variables");
}

// Initialize the Cohere client
const cohere = new CohereClient({
  token: cohereApiKey,
});

export async function POST(req: NextRequest) {
  try {
    const { feedbacks } = await req.json(); // Only feedbacks are received from the request body

    // Filter out user feedbacks
    const userFeedback = feedbacks.filter(
      (feedback: { sender: string }) => feedback.sender === "user"
    );

    // Prepare the prompt for summarization
    const prompt = [
      {
        role: "system",
        content: `Please summarize the following user feedback. Remove any unnecessary spam messages and focus on summarizing valid feedback concisely:`,
      },
      ...userFeedback.map((feedback: any) => ({
        role: "user",
        content: feedback.content,
      })),
    ];

    // Generate summary from Cohere
    const cohereResponse = await cohere.generate({
      model: "command",
      prompt: prompt.map((p) => p.content).join("\n"),
      maxTokens: 150,
    });

    const aiResponse = cohereResponse.generations[0].text.trim();

    console.log("summary ai response: ", aiResponse);

    // Return AI-generated response
    return NextResponse.json({
      content: aiResponse || "No valid feedback to summarize.",
    });
  } catch (error) {
    console.error("Error processing request: ", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
