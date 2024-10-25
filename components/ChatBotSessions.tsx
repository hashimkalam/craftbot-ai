"use client";

import { Chatbot } from "@/types/types";
import { Accordion } from "@radix-ui/react-accordion";
import { useEffect, useState, useTransition } from "react";
import logo from "@/public/images/just_logo.webp";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import Image from "next/image";

import { ExternalLink } from "lucide-react";
import NotCreatedChatbot from "./NotCreatedChatbot";
import Loading from "@/app/dashboard/loading"; // Import the Loading component

function ChatBotSessions({ chatbots }: { chatbots: Chatbot[] }) {
  const router = useRouter();
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);
  const [pendingChatbotId, setPendingChatbotId] = useState<number | null>(null); // Track specific chatbot loading

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

  return (
    <div className="bg-white dark:bg-primary-DARK">
      <Accordion type="single" collapsible>
        {sortedChatbots.length !== 0 ? (
          <div className="p-2 shadow-md rounded-md">
            {sortedChatbots.map((chatbot) => {
              return (
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
              );
            })}
          </div>
        ) : (
          <NotCreatedChatbot />
        )}
      </Accordion>
    </div>
  );
}

export default ChatBotSessions;
