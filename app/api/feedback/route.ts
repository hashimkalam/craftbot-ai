import {
  GET_FEEDBACKS_BY_CHAT_SESSION_ID,
  INSERT_FEEDBACK,
} from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import { NextRequest, NextResponse } from "next/server";
import { formatISO } from "date-fns";
import { CohereClient } from "cohere-ai";
import {
  FeedbackByChatSessionIdResponse,
  GetChatbotByIdResponse,
} from "@/types/types";

const cohereApiKey = process.env.COHERE_API_KEY;

if (!cohereApiKey) {
  throw new Error("Oops! COHERE_API_KEY is missing in your environment variables.");
}

// Initialize the Cohere client
const cohere = new CohereClient({
  token: cohereApiKey,
});

export async function POST(req: NextRequest) {
  // Destructure the incoming request
  const { id, content, sentiment, chatbot_id } = await req.json();
  // console.log("Feedback submission received:", { id, content, sentiment, chatbot_id });

  try {
    // Step 1: Get the chatbot's details
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data?.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "Sorry, we couldn't find that chatbot." }, { status: 404 });
    }

    // console.log("Chatbot data:", data);

    // Step 2: Retrieve previous feedback messages
    const { data: feedbackData } =
      await serverClient.query<FeedbackByChatSessionIdResponse>({
        query: GET_FEEDBACKS_BY_CHAT_SESSION_ID,
        variables: { chat_session_id: Number(id) },
        fetchPolicy: "no-cache",
      });

    // console.log("Previous Feedback Data:", feedbackData);

    if (!feedbackData || !feedbackData?.chat_sessions) {
      return NextResponse.json(
        { error: "No previous feedback found." },
        { status: 404 }
      );
    }

    const prevFeedback = feedbackData?.chat_sessions?.feedbacks || [];

    // Clean up the feedback array
    const validFeedback = prevFeedback.filter((feedback) => feedback !== null);

    // Prepare feedback for Cohere
    const formattedPrevFeedback = validFeedback.map((feedback) => ({
      role: feedback?.sender === "ai" ? "system" : "user",
      content: feedback?.content,
    }));
    // console.log("formattedPrevFeedback:", formattedPrevFeedback);

    // Create a system prompt using chatbot characteristics
    const systemPrompt = chatbot?.chatbot_characteristics
      .map((char) => char?.content)
      .join(" + ");
    // console.log("System prompt created:", systemPrompt);

    const prompt = [
      {
        role: "system",
        content: `You are a feedback assistant. You are to only accept feedbacks and not answer questions. Here are some details about you: ${systemPrompt}. You should acknowledge feedback politely and positively, without providing help. Here's the customer's feedback: ${formattedPrevFeedback}. Keep your response under 50 words - as short as possible.`,
      },
      ...formattedPrevFeedback,
      {
        role: "user",
        content: content,
      },
    ];

    // Generate a response with Cohere
    const response = await cohere.generate({
      model: "command",
      prompt: prompt.map((p) => p.content).join("\n"),
      maxTokens: 100,
    });

    // console.log("Generated prompt:", prompt.map((p) => p.content).join("\n"));

    const aiResponse = response.generations[0].text.trim();
    // console.log("AI response:", aiResponse);

    if (!aiResponse) {
      return NextResponse.json({
        error: "AI response generation failed.",
        status: 500,
      });
    }

    // Step 3: Save user feedback
    const userFeedbackResult = await serverClient.mutate({
      mutation: INSERT_FEEDBACK,
      variables: {
        chat_session_id: Number(id),
        sender: "user",
        content,
        sentiment,
        created_at: formatISO(new Date()),
      },
    });

    // Step 4: Save AI's response as a message
    const aiFeedbackResult = await serverClient.mutate({
      mutation: INSERT_FEEDBACK,
      variables: {
        chat_session_id: Number(id),
        sender: "ai",
        content: aiResponse,
        sentiment: "NEUTRAL",
        created_at: formatISO(new Date()),
      },
    });

    return NextResponse.json({
      userFeedbackId: userFeedbackResult?.data?.insertFeedback?.id,
      aiFeedbackId: aiFeedbackResult?.data?.insertFeedback?.id,
      content: aiResponse,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { error: error || "Internal Server Error" },
      { status: 500 }
    );
  }
}
