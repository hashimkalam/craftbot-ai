"use client";

import { Chatbot } from "@/types/types";
import { useEffect, useState, Suspense, lazy } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import Loading from "@/app/dashboard/loading";
import CountDisplayAnimation from "./CountDisplayAnimation";
import PieChartComponent from "./PieChartComponent";
import FeedbackSentimentCalc from "./FeedbackSentimentCalc";
import TotalTimeInteracted from "./TotalTimeInteracted"; 

const CommonFeedback = lazy(() => import("./CommonFeedback"));
const ChatSessionTable = lazy(() => import("./ChatSessionTable"));
const FeedbackLineChart = lazy(() => import("./FeedbackLineChart"));

function Index({
  chatbots,
  chatbotId,
  feedbackData,
  messageData
}: {
  chatbots: Chatbot[];
  chatbotId: number;
  feedbackData: any;
  messageData: any
}) {
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]); 
  const [totalGuests, setTotalGuests] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(false);

  // Sort chatbots based on number of sessions
  useEffect(() => {
    const sortedArray = [...chatbots].sort(
      (a, b) => b.chat_sessions.length - a.chat_sessions.length
    );
    setSortedChatbots(sortedArray);
  }, [chatbots]);

  // Filter sessions based on chatbotId
  useEffect(() => {
    setLoadingCount(true); // Set loading state to true
    try {
      if (chatbotId) {
        const currentChatbot = sortedChatbots.find(
          (chatbot) => Number(chatbot.id) === Number(chatbotId)
        );

        if (currentChatbot) {
          const newFilteredSessions = currentChatbot.chat_sessions;
          setFilteredSessions(newFilteredSessions);
          setTotalGuests(newFilteredSessions.length);
        } else {
          setFilteredSessions([]);
          setTotalGuests(0);
        }
      }
    } finally {
      setLoadingCount(false); // Set loading state to false
    }
  }, [chatbotId, sortedChatbots]);

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


  // total feedback
  const filteredFeedbackData = feedbackData.filter(
    (item: { sender: string }) => item.sender === "user"
  );
  const totalFeedbackCount = filteredFeedbackData.length;

  // total messages
  const totalMessagesCount = messageData.length
  

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full grid col-span-2">
          <TotalTimeInteracted
            filteredSessions={filteredSessions} 
          />
        </div>
        <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full h-full">
          <CountDisplayAnimation
            text="Total Guest Count:"
            count={totalGuests}
            loadingCount={loadingCount}
          />
        </div>
        <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full h-full">
          <CountDisplayAnimation
            text="Total Feedback Count:"
            count={totalFeedbackCount}
            loadingCount={loadingCount}
          />
        </div>
      </div>

      <div className="relative mt-4 flex flex-col lg:flex-row items-center gap-5">
        <div className="bg-white dark:bg-primary/20 shadow-lg min-h-[350px] h-fit w-full flex flex-col relative rounded-lg p-1">
          <h1 className="text-xl font-bold underline ml-2">
            Total Messages Usage
          </h1>
          <PieChartComponent messageCount={totalMessagesCount} maxLimit={500} />
        </div>

        <div className="bg-white dark:bg-primary/20 shadow-lg min-h-[350px] h-fit w-full flex flex-col relative rounded-lg mt-5 lg:mt-0 p-1">
          <FeedbackSentimentCalc
            filteredSessions={filteredSessions}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-primary/20 shadow-lg rounded-xl p-4 w-full h-full mt-5">
        <Suspense fallback={<Loading />}>
          <FeedbackLineChart feedbackData={feedbackData} />
        </Suspense>
      </div>

      <Suspense fallback={<Loading />}>
        <CommonFeedback filteredSessions={filteredSessions} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <ChatSessionTable filteredSessions={filteredSessions} />
      </Suspense>
    </div>
  );
}

export default Index;