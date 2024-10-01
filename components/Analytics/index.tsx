"use client";

import { useRouter } from "next/navigation";
import { Chatbot } from "@/types/types";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import PieChartComponent from "./PieChartComponent";
import TotalTimeUsedPerDay from "./TotalTImeUsedPerDay";
import ChatSessionTable from "./ChatSessionTable";

function Index({
  chatbots,
  chatbotName,
}: {
  chatbots: Chatbot[];
  chatbotName: string;
}) {
  const router = useRouter();
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(0);

  // Sort according to the number of sessions available in each bot
  useEffect(() => {
    const sortedArray = [...chatbots].sort(
      (a, b) => b.chat_sessions.length - a.chat_sessions.length
    );

    setSortedChatbots(sortedArray);
  }, [chatbots]);

  // Filter sessions based on the chatbotName
  useEffect(() => {
    if (chatbotName) {
      const currentChatbot = sortedChatbots.find(
        (chatbot) => chatbot.name === chatbotName
      );
      setFilteredSessions(currentChatbot ? currentChatbot.chat_sessions : []);
    }
  }, [chatbotName, sortedChatbots]);

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

  // Handle the total messages count from TotalTimeUsedPerDay
  const handleTotalMessages = (messagesCount: number) => {
    setTotalMessages(messagesCount);
  };

  return (
    <div className="min-h-screen">
      <div className="relative mt-12">
        <div className="bg-gray-200 h-[50vh] flex flex-col relative rounded-lg">
          <h1 className="text-xl font-bold underline ml-2">
            Total Messages Usage
          </h1>
          <PieChartComponent
            messageCount={totalMessages}
            maxLimit={100}
          />
        </div>
        <div className="bg-gray-300 absolute top-5 right-5 rounded-lg p-2">
          <TotalTimeUsedPerDay
            filteredSessions={filteredSessions}
            handleTotalMessages={handleTotalMessages}
          />
        </div>
      </div>

      {/*<div className="space-y-5 p-5 bg-gray-100 rounded-md">
        {filteredSessions.length !== 0 ? (
          <>
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="relative p-3 px-4 bg-primary text-white rounded-md flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-lg font-bold">
                    {session.guests?.name || "Anonymous"}
                  </p>
                  <p className="text-sm font-light">
                    {session.guests?.email || "No email provided"}
                  </p>
                </div>

                <div className="flex">
                  <Button
                    className="bg-red-500 hover:bg-red-600 cursor-pointer m-1"
                    onClick={() => handleDelete(session.id)}
                  >
                    <X size={18} className="-m-1" />
                  </Button>
                  <Button
                    className="bg-white hover:bg-gray-300 text-black cursor-pointer m-1"
                    onClick={() =>
                      router.push(`/dashboard/review-sessions/${session.id}`)
                    }
                  >
                    <ExternalLink size={18} className="-m-1" />
                  </Button>
                </div>
              </div>
            ))} 
          </>
        ) : (
          <p>No chat sessions available.</p>
        )}
      </div>*/}


      <ChatSessionTable filteredSessions={filteredSessions} />
    </div>
  );
}

export default Index;
