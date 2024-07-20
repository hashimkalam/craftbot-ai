"use client";

import { Chatbot } from "@/types/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { AccordionContent } from "./ui/accordion";
import Link from "next/link";
import ReactTimeago from "react-timeago";
 

function ChatBotSessions({ chatbots }: { chatbots: Chatbot[] }) {
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);

  // sorts according to number of session available in each bot
  useEffect(() => {
    const sortedArray = [...chatbots].sort(
      (a, b) => b.chat_sessions.length - a.chat_sessions.length
    );

    setSortedChatbots(sortedArray);
  }, [chatbots]);

  console.log("sortedChatbots: ", sortedChatbots);

  return (
    <div className="bg-white">
      <Accordion type="single" collapsible>
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
                      <Avatar seed={chatbot.name} className="h-10 w-10 mr-4" />
                     <div className="flex items-center justify-between w-full">
                      <p>{chatbot.name}</p>
                      <p className="pr-4 font-bold text-right">
                        {chatbot.chat_sessions.length} sessions
                      </p></div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="space-y-5 p-5 bg-gray-100 rounded-md">
                    {chatbot.chat_sessions.map((session) => (
                      <Link
                        href={`/review-sessions/${session.id}`}
                        key={session.id}
                        className="relative p-10 bg-[#2991ee] text-white rounded-md block"
                      >
                        <p className="text-lg font-bold">
                          {session.guests?.name || "Annonymous"}
                        </p>
                        <p className="text-sm font-light">
                          {session.guests?.email || "No email provided"}
                        </p>
                      {/*  <p className="absolute top-5 right-5 text-sm">
                          <ReactTimeago data={new Date(session.created_at)} />
                        </p> */}
                      </Link>
                    ))}
                  </AccordionContent>
                </>
              ) : (
                <p className="font-light">(No Sessions)</p>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default ChatBotSessions;
