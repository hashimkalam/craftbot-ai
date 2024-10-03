import { INSERT_FEEDBACK } from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import { NextRequest, NextResponse } from "next/server";
import { formatISO } from "date-fns";
import { CohereClient } from 'cohere-ai';

const cohereApiKey = process.env.COHERE_API_KEY;

if (!cohereApiKey) {
  throw new Error("COHERE_API_KEY is not defined in the environment variables");
}

// Initialize the Cohere client
const cohere = new CohereClient({
  token: cohereApiKey,
});

export async function POST(req: NextRequest) {
  const { id, content, sentiment, chatbot_id } = await req.json();
  console.log("Received feedback submission with: ", { id, content, sentiment, chatbot_id });

  try {
    // Fetch chatbot characteristics if needed
    const { data } = await serverClient.query({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Generate a response or acknowledgment for the feedback
    const systemPrompt = chatbot.chatbot_characteristics
      .map((char: any) => char.content)
      .join(" + ");
    console.log("System prompt for feedback: ", systemPrompt);

    const prompt = [
      {
        role: "system",
        content: `You are a feedback assistant. Here are the customers feedback: ${systemPrompt}. Please acknowledge the feedback and be positive, helpful, and say we will get back with you. Appreciate their feedback.`,
      },
      {
        role: "user",
        content: content,
      },
    ];

    // Generate a response using Cohere
    const response = await cohere.generate({
      model: 'command', // Ensure you use the correct model name
      prompt: prompt.map(p => p.content).join("\n"), // Join prompt array as a string
      maxTokens: 50, // Adjust token limit as needed
    });

    const aiResponseMessage = response.generations[0].text.trim();
    console.log("AI response for feedback: ", aiResponseMessage);

    if (!aiResponseMessage) {
      return NextResponse.json({
        error: "Failed to generate AI response",
        status: 500,
      });
    }

    // Save feedback in the database
    const feedbackResult = await serverClient.mutate({
      mutation: INSERT_FEEDBACK,
      variables: {
        chat_session_id: Number(id), // Ensure this is correct
        content,
        sentiment,
        created_at: formatISO(new Date()), // Current timestamp
      },
    });

    console.log("Feedback saved successfully: ", feedbackResult);

    return NextResponse.json({
      id: feedbackResult?.data?.insertFeedback?.id,
      content: aiResponseMessage,
    });

  } catch (error) {
    console.error("Error submitting feedback: ", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
