// utils/fetchChatbots.ts
import { serverClient } from "@/lib/server/serverClient";
import {
  Chatbot,
  GetChatbotsByUserData,
  GetChatbotsByUserDataVariables,
} from "@/types/types";
import { GET_CHATBOT_BY_USER } from "@/graphql/query";

export async function fetchChatbots(userId: string): Promise<Chatbot[]> {
  try {
    const response = await serverClient.query<
      GetChatbotsByUserData,
      GetChatbotsByUserDataVariables
    >({
      query: GET_CHATBOT_BY_USER,
      variables: { clerk_user_id: userId },
    });

    const { data } = response;

    // Sort and filter chatbots by created_at date for the specific user
    return [...data.chatbotsList]
      .filter((chatbot) => chatbot.clerk_user_id === userId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    throw new Error("Error fetching chatbots");
  }
}
