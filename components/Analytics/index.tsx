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
import FeedbackLineChart from "./FeedbackLineChart";

const CommonFeedback = lazy(() => import("./CommonFeedback"));
const ChatSessionTable = lazy(() => import("./ChatSessionTable"));

function Index({
  chatbots,
  chatbotId,
  feedbackData,
  messageData,
  subscriptionPlan
}: {
  chatbots: Chatbot[];
  chatbotId: number;
  feedbackData: any;
  messageData: any;
  subscriptionPlan: string | undefined
}) {
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [totalGuests, setTotalGuests] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(true);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  // Hooks must be declared before any return statement
  useEffect(() => {
    const sortData = async () => {
      setLoadingCount(true);
      const sortedArray = [...chatbots].sort(
        (a, b) => b.chat_sessions.length - a.chat_sessions.length
      );
      setSortedChatbots(sortedArray);
      setLoadingCount(false);
    };

    sortData();
  }, [chatbots]);

  useEffect(() => {
    const filterSessions = async () => {
      setLoadingCount(true);
      setIsDataReady(false);

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
      } catch (error) {
        console.error("Error filtering sessions:", error);
        toast.error("Error loading session data");
      } finally {
        setLoadingCount(false);
        setIsDataReady(true);
      }
    };

    filterSessions();
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

  // Calculate totals
  const filteredFeedbackData = feedbackData.filter(
    (item: { sender: string }) => item.sender === "user"
  );
  const totalFeedbackCount = filteredFeedbackData.length;
  const totalMessagesCount = messageData.length;

  // Now move the conditional return after all hooks have been called
  if (!messageData || !feedbackData || !isDataReady) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense
          fallback={
            <div className="col-span-2">
              <Loading />
            </div>
          }
        >
          <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-2 w-full grid col-span-2">
            <TotalTimeInteracted messageData={messageData} />
          </div>
        </Suspense>

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
        <Suspense fallback={<Loading />}>
          <div className="bg-white dark:bg-primary/20 shadow-lg min-h-[350px] h-fit w-full flex flex-col relative rounded-lg p-1">
            <h1 className="text-xl font-bold underline ml-2">
              Total Messages Usage
            </h1>
            <PieChartComponent
              messageCount={totalMessagesCount} 
              subscriptionPlan={subscriptionPlan}

            />
          </div>
        </Suspense>

        <div className="bg-white dark:bg-primary/20 shadow-lg min-h-[350px] h-fit w-full flex flex-col relative rounded-lg mt-5 lg:mt-0 p-1">
          <FeedbackSentimentCalc feedbackData={feedbackData} />
        </div>
      </div>

      <div className="bg-white dark:bg-primary/20 shadow-lg rounded-xl p-4 w-full h-full mt-5">
        <FeedbackLineChart feedbackData={feedbackData} />
      </div>
      {/* 
      <Suspense fallback={<Loading />}>
        <CommonFeedback feedbackData={feedbackData} />
      </Suspense> */}

      <Suspense fallback={<Loading />}>
        <ChatSessionTable filteredSessions={filteredSessions} />
      </Suspense>
    </div>
  );
}

export default Index;
