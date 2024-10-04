import { Suspense, lazy } from "react";

// Lazy load the Analytics component
const Analytics = lazy(() => import("@/components/Analytics"));

import { GET_USER_CHATBOTS } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  Chatbot,
  GetUserChatbotsResponse,
  GetUserChatbotsVariables,
} from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import Loading from "@/app/dashboard/loading";

async function ReviewSessions({
  params: { chatbotId },
}: {
  params: { chatbotId: number };
}) {
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

  const { data } = response;

  // sorting chatbots by created_at date
  const sortedChatbotsByUser: Chatbot[] = [...data?.chatbotsList].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredChatbots: Chatbot[] = sortedChatbotsByUser.filter(
    (chatbot) => chatbot.clerk_user_id === userId
  );

  return (
    <div className="flex-1 px-10 min-h-screen">
      <h1 className="text-xl lg:text-3xl font-semibold mt-10">
        Chat Sessions - ({chatbotId})
      </h1>
      <h2 className="mb-5">
        Review all the chat sessions the chat bots have and with your customers
      </h2>

      <Suspense fallback={<Loading />}>
        <Analytics chatbots={filteredChatbots} chatbotId={chatbotId} />
      </Suspense>
    </div>
  );
}

export default ReviewSessions;
