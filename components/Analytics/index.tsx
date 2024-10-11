"use client";

import { Chatbot } from "@/types/types";
import { useEffect, useState, Suspense, lazy } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";

const CountDisplayAnimation = lazy(() => import("./CountDisplayAnimation"));
const PieChartComponent = lazy(() => import("./PieChartComponent"));
const TotalTimeInteracted = lazy(() => import("./TotalTimeInteracted"));
const ChatSessionTable = lazy(() => import("./ChatSessionTable"));
const FeedbackSentimentCalc = lazy(() => import("./FeedbackSentimentCalc"));

function Index({
  chatbots,
  chatbotId,
}: {
  chatbots: Chatbot[];
  chatbotId: number;
}) {
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [totalFeedback, setTotalFeedback] = useState<number>(0);
  const [totalGuests, setTotalGuests] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(false);

  // Sort according to the number of sessions available in each bot
  useEffect(() => {
    const sortedArray = [...chatbots].sort(
      (a, b) => b.chat_sessions.length - a.chat_sessions.length
    );

    setSortedChatbots(sortedArray);
  }, [chatbots]);

  // Filter sessions based on the chatbotId
  useEffect(() => {
    // console.log("chatbotId: ", chatbotId);
    setLoadingCount(true); // Set loading state to true at the start

    try {
      if (chatbotId) {
        const currentChatbot = sortedChatbots.find(
          (chatbot) => Number(chatbot.id) === Number(chatbotId)
        );
        // console.log("currentChatbot: ", currentChatbot);

        if (currentChatbot) {
          // console.log("Chat Sessions: ", currentChatbot.chat_sessions);

          // Update filteredSessions first
          const newFilteredSessions = currentChatbot.chat_sessions;
          setFilteredSessions(newFilteredSessions);

          // Set totalGuests after filtering sessions
          setTotalGuests(newFilteredSessions.length);
        } else {
          // console.log("No matching chatbot found.");
          setFilteredSessions([]);
          setTotalGuests(0);
        }
      }
    } finally {
      setLoadingCount(false); // Set loading state to false after completion
    }
  }, [chatbotId, sortedChatbots]);

  // console.log("sortedChatbots: ", sortedChatbots);
  // console.log("filteredSessions: ", filteredSessions);

  const [deleteChatSession] = useMutation(DELETE_CHATSESSION, {
    refetchQueries: ["GetChatbotById"],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("Successfully deleted ChatSession");
    },
    onError: (error) => {
      console.error("Error deleting ChatSession: ", error);
      toast.error("Failed to delete ChatSession");
    },
  });

  const handleDelete = async (id: any) => {
    const promise = deleteChatSession({ variables: { id } });
    toast.promise(promise, {
      loading: "Deleting...",
      success: () => {
        setFilteredSessions((prevSessions) =>
          prevSessions.filter((session) => session.id !== id)
        );
        return "Successfully deleted ChatSession";
      },
      error: () => "Failed to delete ChatSession",
    });
  };

  // Handle the total messages count from TotalTimeInteracted
  const handleTotalMessages = (messagesCount: number) => {
    setTotalMessages(messagesCount);
  };

  // Handle the total feedback count from TotalTimeInteracted
  const handleTotalFeedback = (feedbackCount: number) => {
    setTotalFeedback(feedbackCount);
  };

  // console.log("totalMessages: ", totalMessages);

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full grid col-span-2">
          <Suspense fallback={<Loading />}>
            <TotalTimeInteracted
              filteredSessions={filteredSessions}
              handleTotalMessages={handleTotalMessages}
            />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full h-full">
          <Suspense fallback={<Loading />}>
            <CountDisplayAnimation
              text="Total Guest Count:"
              count={totalGuests}
              loadingCount={loadingCount}
            />
          </Suspense>
        </div>

        <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full h-full">
          <Suspense fallback={<Loading />}>
            {" "}
            <CountDisplayAnimation
              text="Total Feedback Count:"
              count={totalFeedback}
              loadingCount={loadingCount}
            />
          </Suspense>
        </div>
      </div>

      <div className="relative mt-4 flex flex-col lg:flex-row items-center space-x-0 lg:space-x-5">
        <div className="bg-white dark:bg-primary/20 shadow-lg h-[50vh] w-full flex flex-col relative rounded-lg p-1">
          <h1 className="text-xl font-bold underline ml-2">
            Total Messages Usage
          </h1>
          <Suspense fallback={<Loading />}>
            <PieChartComponent messageCount={totalMessages} maxLimit={100} />
          </Suspense>
        </div>

        <div className="bg-white dark:bg-primary/20 shadow-lg h-[50vh] w-full flex flex-col relative rounded-lg mt-5 lg:mt-0 p-1">
          <Suspense fallback={<Loading />}>
            <FeedbackSentimentCalc
              filteredSessions={filteredSessions}
              handleTotalFeedback={handleTotalFeedback}
            />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <ChatSessionTable filteredSessions={filteredSessions} />
      </Suspense>
    </div>
  );
}

export default Index;
