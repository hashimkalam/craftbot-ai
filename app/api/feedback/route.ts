import { CohereClient } from "cohere-ai";
import { formatISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import {
  GET_FEEDBACKS_BY_CHAT_SESSION_ID,
  INSERT_FEEDBACK,
} from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import { 
  FeedbackByChatSessionIdResponse, 
  GetChatbotByIdResponse 
} from "@/types/types";

interface PromptMessage {
  role: "system" | "user";
  content: string;
}

interface RequestBody {
  id: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  chatbot_id: string;
}

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is required");
}

const cohere = new CohereClient({
  token: COHERE_API_KEY,
});

const createPrompt = (
  chatbotCharacteristics: string,
  formattedPrevFeedback: PromptMessage[],
  content: string
): PromptMessage[] => {
  return [
    {
      role: "system",
      content: `Role: Feedback collector
Scope: ${chatbotCharacteristics}

STRICT RESPONSE RULES:
- ANY message containing:
  * Question words (who, what, where, when, why, how, tell, show, can)
  * Question marks
  * Names or terms asked about the mentioned Scope
  * Requests for information
  * Words like "about", "describe", "explain"
MUST ONLY RECEIVE THIS EXACT RESPONSE:
"Please use our 'Get to Know More' section for questions. Toggle to that section to get detailed answers."

FEEDBACK HANDLING:
- For feedback about the mentioned Scope: acknowledge naturally
- Max response: 50 chars 

Previous feedback: ${JSON.stringify(formattedPrevFeedback)}`
    },
    ...formattedPrevFeedback,
    {
      role: "user",
      content: content
    }
  ];
};

export async function POST(req: NextRequest) {
  try {
    const { id, content, sentiment, chatbot_id } = await req.json() as RequestBody;

    // Get chatbot details
    const { data: chatbotData } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    if (!chatbotData?.chatbots) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        { status: 404 }
      );
    }

    // Get previous feedback
    const { data: feedbackData } = await serverClient.query<FeedbackByChatSessionIdResponse>({
      query: GET_FEEDBACKS_BY_CHAT_SESSION_ID,
      variables: { chat_session_id: Number(id) },
      fetchPolicy: "no-cache",
    });

    const prevFeedback = feedbackData?.chat_sessions?.feedbacks || [];
    const formattedPrevFeedback: PromptMessage[] = prevFeedback
    .filter(Boolean)
    .map(feedback => ({
      role: feedback?.sender === "ai" ? "system" : "user" as "system" | "user",
      content: feedback?.content,
    }));
  
    const chatbotCharacteristics = chatbotData.chatbots.chatbot_characteristics
      .map(char => char?.content)
      .filter(Boolean)
      .join(" + ");

    // Create prompt using the specified structure
    const prompt = createPrompt(
      chatbotCharacteristics,
      formattedPrevFeedback,
      content
    );

    // Generate response with Cohere
    const response = await cohere.generate({
      model: "command",
      prompt: prompt.map(p => p.content).join("\n"),
      maxTokens: 100,
      temperature: 0.3, // Lower temperature for more consistent responses
      stopSequences: ["Human:", "Assistant:"],
    });

    const aiResponse = response.generations[0]?.text?.trim();

    if (!aiResponse) {
      throw new Error("Failed to generate response");
    }

    // Save feedback in parallel
    const [userFeedback, aiFeedback] = await Promise.all([
      serverClient.mutate({
        mutation: INSERT_FEEDBACK,
        variables: {
          chat_session_id: Number(id),
          sender: "user",
          content,
          sentiment,
          created_at: formatISO(new Date()),
        },
      }),
      serverClient.mutate({
        mutation: INSERT_FEEDBACK,
        variables: {
          chat_session_id: Number(id),
          sender: "ai",
          content: aiResponse,
          sentiment: "NEUTRAL",
          created_at: formatISO(new Date()),
        },
      }),
    ]);

    return NextResponse.json({
      userFeedbackId: userFeedback?.data?.insertFeedback?.id,
      aiFeedbackId: aiFeedback?.data?.insertFeedback?.id,
      content: aiResponse,
    });

  } catch (error) {
    console.error("Feedback processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}