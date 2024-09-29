"use client";

import { Chatbot } from "@/types/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import logo from "@/public/images/just_logo.png";
import { AccordionContent } from "./ui/accordion";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { DELETE_CHATSESSION } from "@/graphql/mutation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="bg-white">
      <Accordion type="single" collapsible>
        {sortedChatbots.length !== 0 ? (
          <>
            {" "}
            {sortedChatbots.map((chatbot) => {
              const hasSessions = chatbot.chat_sessions.length > 0;

              return (
                <AccordionItem
                  key={chatbot.id}
                  value={`item-${chatbot.id}`}
                  className="px-10 py-5"
                >
                  {hasSessions ? (
                    <>
                      <AccordionTrigger className="w-full">
                        <div className="flex text-left items-center w-full">
                          <Image src={logo} alt="Logo" className="h-10 w-10 mr-4" />
                          <div className="flex items-center justify-between w-full">
                            <p>{chatbot.name}</p>
                            <p className="pr-4 font-bold text-right hover:underline">
                              {chatbot.chat_sessions.length} sessions
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="space-y-5 p-5 bg-gray-100 rounded-md">
                        {chatbot.chat_sessions.map((session) => (
                          <div
                            key={session.id}
                            className="relative p-10 bg-[#2991ee] text-white rounded-md flex items-center justify-between"
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
                                className="bg-white hover:bg-gray-300 text-black p-5 cursor-pointer m-2"
                                onClick={() =>
                                  router.push(`/dashboard/review-sessions/${session.id}`)
                                }
                              >
                                <ExternalLink />
                              </Button>
                              <Button
                                className="bg-red-500 hover:bg-red-600 p-5  cursor-pointer m-2"
                                onClick={() =>
                                  handleDelete(session.id, chatbot.id)
                                }
                              >
                                <X />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </>
                  ) : (
                    <p className="font-light">(No Sessions)</p>
                  )}
                </AccordionItem>
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
