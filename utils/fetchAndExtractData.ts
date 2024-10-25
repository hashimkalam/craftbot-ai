// feedbackUtils.ts
import { serverClient } from "@/lib/server/serverClient";
import { GET_CHAT_SESSION_MESSAGES, GET_CHATBOT_BY_ID } from "@/graphql/query";
import {
  GetChatSessionMessagesResponse,
  GetChatSessionMessagesVariables,
  Feedback,
  Message, 
} from "@/types/types";

// Function to extract feedbacks and messages from a chat session ID
export const fetchAndExtractFeedbacks_Messages = async (
  chatSessionId: number
): Promise<{
  messages: any[]; // Adjust the type according to your messages structure
  feedbacks: Feedback[];
  chatbotName: string;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}> => {
  const response = await serverClient.query<
    GetChatSessionMessagesResponse,
    GetChatSessionMessagesVariables
  >({
    query: GET_CHAT_SESSION_MESSAGES,
    variables: { id: chatSessionId },
  });

  const { chat_sessions } = response.data;

  if (!chat_sessions) {
    throw new Error("No chat session found with this ID.");
  }

  const {
    created_at,
    messages,
    feedbacks,
    chatbots: { name: chatbotName },
    guests: { name: guestName, email: guestEmail },
  } = chat_sessions;

  return {
    messages,
    feedbacks,
    chatbotName,
    guestName,
    guestEmail,
    createdAt: created_at,
  };
};

// Function to extract all feedbacks from a specific chatbot ID
export const fetchFeedbacksByChatbotId = async (chatbotId: number): Promise<Feedback[]> => {
    // Fetch the chatbot by ID, which includes its chat sessions and feedbacks
    const response = await serverClient.query({
        query: GET_CHATBOT_BY_ID,
        variables: { id: chatbotId },
    });

    // Log the response for debugging
    console.log("Response from GET_CHATBOT_BY_ID:", response.data);

    const { chatbots } = response.data;

    if (!chatbots || chatbots.length === 0) {
        throw new Error("No chatbot found with this ID.");
    }

    const { chat_sessions } = chatbots;

    // Flatten the feedbacks array from all chat sessions
    const allFeedbacks: Feedback[] = chat_sessions.flatMap((session: { feedbacks: any; }) => session.feedbacks);

    // Log the extracted feedbacks for debugging
    console.log("Extracted Feedbacks:", allFeedbacks);

    return allFeedbacks;
};


export const fetchMessagesByChatbotId = async (chatbotId: number): Promise<Message[]> => {
  // Fetch the chatbot by ID, which includes its chat sessions and feedbacks
  const response = await serverClient.query({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbotId },
  });

  // Log the response for debugging
  console.log("Response from GET_CHATBOT_BY_ID:", response.data);

  const { chatbots } = response.data;

  if (!chatbots || chatbots.length === 0) {
      throw new Error("No chatbot found with this ID.");
  }

  const { chat_sessions } = chatbots;

  // Flatten the feedbacks array from all chat sessions
  const allMessages: Message[] = chat_sessions.flatMap((session: { messages: any; }) => session.messages);

  // Log the extracted feedbacks for debugging
  console.log("Extracted Feedbacks:", allMessages);

  return allMessages;
};
