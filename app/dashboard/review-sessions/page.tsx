import ChatBotSessions from "@/components/ChatBotSessions";
import { GET_USER_CHATBOTS } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  Chatbot,
  GetUserChatbotsResponse,
  GetUserChatbotsVariables,
} from "@/types/types";
import { auth } from "@clerk/nextjs/server";

async function ReviewSessions() {
  const { userId } = await auth();
  if (!userId) return <div>User ID not found. Please log in.</div>;

  const response = await serverClient.query<
    GetUserChatbotsResponse,
    GetUserChatbotsVariables
  >({
    query: GET_USER_CHATBOTS,
    variables: {
      userId,
    },
  });

  console.log("review session response: ", response);

  const { data } = response;

  // sorting chatbots by created_at date
  const sortedChatbotsByUser: Chatbot[] = [...data?.chatbotsList].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredChatbots: Chatbot[] = sortedChatbotsByUser.filter(
    (chatbot) => chatbot.clerk_user_id === userId
  );
  console.log("filteredChatbots: ", filteredChatbots);

  return (
    <div className="flex-1 px-10 ">
      <h1 className="text-xl lg:text-3xl font-semibold mt-10">Chat Sessions</h1>
      <h2 className="mb-5">
        Review all the chat sessions the chat bots have and with your customers
      </h2>


      <ChatBotSessions chatbots={filteredChatbots} />
    </div>
  );
}

export default ReviewSessions;
