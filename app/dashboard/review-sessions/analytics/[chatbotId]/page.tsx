import { GET_USER_CHATBOTS } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  Chatbot,
  GetUserChatbotsResponse,
  GetUserChatbotsVariables,
} from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import Loading from "@/app/dashboard/loading";
import {
  fetchFeedbacksByChatbotId,
  fetchMessagesByChatbotId,
} from "@/utils/fetchAndExtractData";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Use dynamic import with no SSR for Analytics
const Analytics = dynamic(() => import("@/components/Analytics/index"), {
  ssr: false,
  loading: () => <Loading />
});

export default async function ReviewSessions({
  params: { chatbotId },
}: {
  params: { chatbotId: number };
}) {
  const { userId } = await auth();
  if (!userId) return <div>User ID not found. Please log in.</div>;

  try {
    // Fetch all data concurrently
    const [chatbotsResponse, feedbackData, messageData] = await Promise.all([
      serverClient.query<GetUserChatbotsResponse, GetUserChatbotsVariables>({
        query: GET_USER_CHATBOTS,
        variables: {
          userId,
        },
      }),
      fetchFeedbacksByChatbotId(chatbotId),
      fetchMessagesByChatbotId(chatbotId)
    ]);

    if (!chatbotsResponse) {
      return <div>Failed to load data. Please try again later.</div>;
    }

    const { data } = chatbotsResponse;

    // Sorting chatbots by created_at date
    const sortedChatbotsByUser: Chatbot[] = [...data?.chatbotsList].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const filteredChatbots: Chatbot[] = sortedChatbotsByUser.filter(
      (chatbot) => chatbot.clerk_user_id === userId
    );

    return (
      <div className="flex-1 px-10 min-h-screen">
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/review-sessions"
            className="cursor-pointer hover:bg-gray-100 rounded-lg pr-0.5"
          >
            <ChevronLeft size={32} />
          </Link>

          <div className="flex flex-col">
            <h1 className="text-xl lg:text-3xl font-semibold mt-10">
              Chat Sessions - ({chatbotId})
            </h1>
            <h2 className="mb-5">
              Review all the chat sessions the chat bots have and with your
              customers
            </h2>
          </div>
        </div>

        <Suspense fallback={<Loading />}>
          <Analytics
            feedbackData={feedbackData}
            messageData={messageData}
            chatbots={filteredChatbots}
            chatbotId={chatbotId}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Failed to load data. Please try again later.</div>;
  }
}