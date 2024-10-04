"use client";

import { Chatbot } from "@/types/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import logo from "@/public/images/just_logo.png";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

import { ExternalLink } from "lucide-react";

function ChatBotSessions({ chatbots }: { chatbots: Chatbot[] }) {
  const router = useRouter();
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);

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

  return (
    <div className="bg-white dark:bg-primary-DARK">
      <Accordion type="single" collapsible>
        {sortedChatbots.length !== 0 ? (
          <>
            {" "}
            {sortedChatbots.map((chatbot) => {
              return (
                <div key={chatbot.id} className="px-10 py-5">
                  <>
                    <div className="w-full">
                      <div className="flex text-left items-center w-full">
                        <Image
                          src={logo}
                          alt="Logo"
                          className="h-10 w-10 mr-4"
                        />
                        <div className="flex items-center justify-between w-full">
                          <p>{chatbot.name}</p>

                          <ExternalLink
                            onClick={() =>
                              router.push(
                                `/dashboard/review-sessions/analytics/${chatbot.id}`
                              )
                            }
                            className="cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                </div>
              );
            })}
          </>
        ) : (
          <div className="bg-gray-100">
            <p>
              You have not created any chatbots yet to even have sessions. Click
              on the button below to create one!
            </p>
            <Link href="/dashboard/create-chatbot">
              <Button className="bg-primary/95 hover:bg-primary text-white p-3 rounded-md mt-5">
                Create Chatbot
              </Button>
            </Link>
          </div>
        )}
      </Accordion>
    </div>
  );
}

export default ChatBotSessions;
