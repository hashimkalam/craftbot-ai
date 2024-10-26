// pages/dashboard/review-sessions/[chatbotId].tsx
import { fetchReviewSessionData } from "@/utils/fetchReviewSessionData";
import { notFound } from "next/navigation"; // For handling errors in server-rendered pages
import Analytics from "@/components/Analytics/index";
import Loading from "@/app/dashboard/loading";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ReviewSessions({ params: { chatbotId } }: { params: { chatbotId: number } }) {
  try {
    const { filteredChatbots, feedbackData, messageData, subscriptionPlan } =
      await fetchReviewSessionData(chatbotId);

    return (
      <div className="flex-1 px-10 min-h-screen">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/review-sessions" className="cursor-pointer hover:bg-gray-100 rounded-lg pr-0.5">
            <ChevronLeft size={32} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-3xl font-semibold mt-10">Chat Sessions - ({chatbotId})</h1>
            <h2 className="mb-5">Review all the chat sessions the chatbots have with your customers</h2>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <Analytics
            feedbackData={feedbackData}
            messageData={messageData}
            chatbots={filteredChatbots}
            chatbotId={chatbotId}
            subscriptionPlan={subscriptionPlan}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
