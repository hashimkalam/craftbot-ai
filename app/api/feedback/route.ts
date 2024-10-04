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
  GetChatbotByIdResponse 
} from "@/types/types"; 

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
  console.log("Received feedback submission with: ", {
    id,
    content,
    sentiment,
    chatbot_id,
  });

  try {
    // Fetch chatbot characteristics if needed
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data?.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    console.log("data(feedback/route): ", data)
    // Fetch user's previous feedback messages
    const { data: feedbackData } = await serverClient.query<FeedbackByChatSessionIdResponse>({
      query: GET_FEEDBACKS_BY_CHAT_SESSION_ID,
      variables: { chat_session_id: Number(id) },
      fetchPolicy: "no-cache",
    });

    console.log("Feedback Data: ", feedbackData);

    if (!feedbackData || !feedbackData?.chat_sessions) {
      return NextResponse.json({ error: "No feedback data found." }, { status: 404 });
    }

    const prevFeedback = feedbackData?.chat_sessions?.messages || []; // Ensure it's an array

    // Filter out any null feedbacks
    const validFeedback = prevFeedback.filter(feedback => feedback !== null);

    // Format message for Cohere
    const formattedPrevFeedback = validFeedback.map((feedback) => ({
      role: feedback?.sender === "ai" ? "system" : "user",
      content: feedback?.content,
    }));

    // Combine characteristics into a system prompt
    const systemPrompt = chatbot?.chatbot_characteristics
      .map((char) => char?.content)
      .join(" + ");
    console.log("systemPrompt: ", systemPrompt);

    const prompt = [
      {
        role: "system",
        content: `You are a feedback assistant. You are only to receive feedback from people and not help them but be polite with what their feedback is. Here is the customer's feedback: ${systemPrompt}. Please acknowledge the feedback and be positive, helpful, and mention that we will get back with them. Appreciate their feedback.`,
      },
      ...formattedPrevFeedback,
      {
        role: "user",
        content: content,
      },
    ];

    // Generate a response using Cohere
    const response = await cohere.generate({
      model: "command",
      prompt: prompt.map((p) => p.content).join("\n"), // Join prompt array as a string
      maxTokens: 50,
    });

    const aiResponse = response.generations[0].text.trim();
    console.log("aiResponse: ", aiResponse);

    if (!aiResponse) {
      return NextResponse.json({
        error: "Failed to generate AI response",
        status: 500,
      });
    }

    // **Step 1: Save user feedback in the feedback table**
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

    /*if (!userFeedbackResult?.data?.insertFeedback) {
      return NextResponse.json({ error: "Failed to save user feedback" }, { status: 500 });
    }*/

    // **Step 2: Save AI's response as a message in the messages table**
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

    /*if (!aiFeedbackResult?.data?.insertFeedback) {
      return NextResponse.json({ error: "Failed to save AI feedback" }, { status: 500 });
    }*/

    return NextResponse.json({
      userFeedbackId: userFeedbackResult?.data?.insertFeedback?.id,
      aiFeedbackId: aiFeedbackResult?.data?.insertFeedback?.id,
      content: aiResponse,
    });
  } catch (error) {
    console.error("Error sending message: ", error);
    return NextResponse.json({ error: error || "Internal Server Error" }, { status: 500 });
  }
}
