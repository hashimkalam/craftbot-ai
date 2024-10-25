"use client";

import { Chatbot } from "@/types/types";
import { Accordion } from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import logo from "@/public/images/just_logo.webp";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import NotCreatedChatbot from "./NotCreatedChatbot";
import Loading from "@/app/dashboard/loading"; // Import the Loading component

function ChatBotSessions({ chatbots }: { chatbots: Chatbot[] }) {
  const router = useRouter();
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);
  const [pendingChatbotId, setPendingChatbotId] = useState<number | null>(null); // Track specific chatbot loading
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Sort according to the number of sessions available in each bot
  useEffect(() => {
    const sortedArray = [...chatbots].sort(
      (a, b) => b.chat_sessions.length - a.chat_sessions.length
    );
    setSortedChatbots(sortedArray);
  }, [chatbots]);

  const [deleteChatSession] = useMutation(DELETE_CHATSESSION, {
    refetchQueries: ["GetChatbotById"], // refresh chatbots after deletion
    awaitRefetchQueries: true,
  });

  const handleDelete = async (id: any, chatbotId: any) => {
    try {
      const promise = deleteChatSession({ variables: { id } }); // calls mutation function with chat session id
      toast.promise(promise, {
        loading: "Deleting",
        success: "Successfully deleted ChatSession",
        error: "Failed to delete ChatSession",
      });

      // Update state to remove the deleted session
      setSortedChatbots((prevChatbots) =>
        prevChatbots.map((chatbot) =>
          chatbot.id === chatbotId
            ? {
                ...chatbot,
                chat_sessions: chatbot.chat_sessions.filter(
                  (session) => session.id !== id
                ),
              }
            : chatbot
        )
      );
    } catch (error) {
      console.error("Error deleting ChatSession: ", error);
      toast.error("Failed to delete ChatSession");
    }
  };

  const handleNavigate = (chatbotId: number) => {
    setPendingChatbotId(chatbotId); // Set the loading state for the specific chatbot
    router.push(`/dashboard/review-sessions/analytics/${chatbotId}`);
  };

  // Calculate current chatbots to display
  const currentChatbots = sortedChatbots.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0)); // Decrease page index
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const maxPage = Math.ceil(sortedChatbots.length / itemsPerPage) - 1;
      return Math.min(prevPage + 1, maxPage); // Increase page index, but limit to max
    });
  };

  const totalPages = Math.ceil(sortedChatbots.length / itemsPerPage); // Calculate total pages

  return (
    <div className="bg-white dark:bg-primary-DARK">
      <Accordion type="single" collapsible>
        {currentChatbots.length !== 0 ? (
          <div className="p-2 shadow-md rounded-md">
            {currentChatbots.map((chatbot) => (
              <div key={chatbot.id} className="px-10 py-5">
                <div className="w-full">
                  <div className="flex text-left items-center justify-between w-full">
                    <div className="flex items-center">
                      <Image
                        src={logo}
                        alt="Logo"
                        className="h-10 w-10 mr-4"
                        loading="lazy"
                      />
                      <p>{chatbot.name}</p>
                    </div>
                    <div className="">
                      {pendingChatbotId === chatbot.id ? (
                        <Loading className="w-6 h-6" />
                      ) : (
                        <ExternalLink
                          onClick={() => handleNavigate(chatbot?.id)}
                          className="cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex space-x-2 justify-end">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        ) : (
          <NotCreatedChatbot />
        )}
      </Accordion>
    </div>
  );
}

export default ChatBotSessions;
