import { lazy, Suspense } from "react"; 
import Loading from "../../loading";
import { fetchAndExtractFeedbacks_Messages } from "@/utils/fetchAndExtractData";

const MessagesContainer = lazy(() => import("@/components/MessagesContainer"));

export const dynamic = "force-dynamic"; // no caching

async function ReviewSession({ params: { id } }: { params: { id: string } }) {
  try {
    // Parse and validate chat session ID
    const chatSessionId = parseInt(id);
    if (isNaN(chatSessionId)) {
      return <div>Invalid session ID.</div>;
    }

    // Use the utility function to fetch and extract data
    const {
      messages,
      feedbacks,
      chatbotName,
      guestName,
      guestEmail,
      createdAt,
    } = await fetchAndExtractFeedbacks_Messages(chatSessionId);

    return (
      <div className="flex-1 p-10 pb-24">
        <h1 className="text-xl lg:text-3xl font-semibold">Session Review</h1>
        <p className="font-light text-xs text-gray-400 mt-2">
          Started at {new Date(createdAt).toLocaleString()}
        </p>

        <h2 className="font-light mt-2">
          Between {chatbotName} &{" "}
          <span className="font-extrabold">
            {guestName} ({guestEmail})
          </span>
        </h2>

        <Suspense fallback={<Loading />}>
          <MessagesContainer
            messages={messages}
            feedbacks={feedbacks}
            chatbotName={chatbotName}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching chat session messages:", error);
    return (
      <div>Error fetching chat session messages. Please try again later.</div>
    );
  }
}

export default ReviewSession;
