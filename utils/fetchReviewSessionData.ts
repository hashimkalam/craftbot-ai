// utils/fetchReviewSessionData.ts
import { GET_USER_CHATBOTS } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  Chatbot,
  GetUserChatbotsResponse,
  GetUserChatbotsVariables,
} from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import {
  fetchFeedbacksByChatbotId,
  fetchMessagesByChatbotId,
} from "@/utils/fetchAndExtractData";
import { fetchUserByClerkId } from "@/utils/fetchUserData";

export async function fetchReviewSessionData(chatbotId: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const userData = await fetchUserByClerkId(userId);
    const subscriptionPlan = userData.subscription_plan;

    const [chatbotsResponse, feedbackData, messageData] = await Promise.all([
      serverClient.query<GetUserChatbotsResponse, GetUserChatbotsVariables>({
        query: GET_USER_CHATBOTS,
        variables: { userId },
      }),
      fetchFeedbacksByChatbotId(chatbotId),
      fetchMessagesByChatbotId(chatbotId),
    ]);

    if (!chatbotsResponse) throw new Error("Failed to fetch chatbots");

    const sortedChatbots = [...chatbotsResponse.data.chatbotsList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const filteredChatbots = sortedChatbots.filter(
      (chatbot) => chatbot.clerk_user_id === userId
    );

    return {
      filteredChatbots,
      feedbackData,
      messageData,
      subscriptionPlan,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to load data. Please try again later.");
  }
}
