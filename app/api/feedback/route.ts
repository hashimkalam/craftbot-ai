import { CohereClient } from "cohere-ai";
import { formatISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import {
  GET_FEEDBACKS_BY_CHAT_SESSION_ID,
  INSERT_FEEDBACK,
  UPDATE_CHATBOT,
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
      content: `Role: Feedback Collector
Tasks:
- Respond to user feedback.
- Acknowledge feedback regarding the chatbot's characteristics and provide relevant information.

Specific Instructions:
- Limit your responses to 20 characters.
- Ignore question-related prompts.
- Accept all types of feedback—both positive and negative.
- If feedback is positive, thank the user and encourage more interactions.
- If feedback is negative, acknowledge their concern and suggest using the 'Get to Know More' section for detailed answers.

Context:
- Scope: ${chatbotCharacteristics}

Examples:
1. User Feedback: "Great feature!"
   Response: "Thanks! Keep exploring!"

2. User Feedback: "I need help."
   Response: "Please use 'Get to Know More' for details."

3. User Feedback: "This isn't working." or "Who/what/how" related questions
   Response: "Sorry for the trouble! Check 'Get to Know More' for help."

Previous Feedback Context: ${JSON.stringify(formattedPrevFeedback)}

Current Feedback: ${content}`
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

    const chatbot = chatbotData.chatbots;

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

    // Increment the message count for the chatbot
    const updatedFeedbackCount = chatbot.message_count + 2;
    console.log("updatedFeedbackCount: (from server - feedback side) ", updatedFeedbackCount);

    const updateResponse= await serverClient.mutate({
      mutation: UPDATE_CHATBOT,
      variables: {
        id: chatbot.id,
        name: chatbot.name,
        personality: chatbot.personality,
        message_count: updatedFeedbackCount,
      },
    });
    console.log("Update response:", updateResponse);

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
