"use client";

import { Message } from "@/types/types";
import { usePathname } from "next/navigation";
import logo from "@/public/images/just_logo.png";
import { UserCircle } from "lucide-react";

import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import Image from "next/image";

function Messages({
  messages,
  chatbotName,
}: {
  messages: Message[];
  chatbotName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // check path
  const path = usePathname();
  const isReviewPage = path.includes("review-sessions");

  console.log("messages: ", messages);
  console.log("chatbotname: ", chatbotName);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-10 py-10 px-5 bg-white rounded-lg">
      {messages.map((message) => {
        const isSender = message.sender !== "user";
        console.log("message.sender: ", message.sender);
        return (
          <div
            key={message.id}
            className={`chat ${isSender ? "chat-start" : "chat-end"} relative`}
          >
            {!isReviewPage && (
              <p className="absolute -bottom-5 text-xs text-gray-300">
                sent {new Date(message.created_at).toLocaleString()}
              </p>
            )}

            <div className={`chat-image avatar w-10 ${!isSender && "-mr-4"}`}>
              {isSender ? (
                <Image src={logo} alt="Logo" className="h-12 w-12" />
                        
              ) : (
                <UserCircle className="text-[#2991ee]" />
              )}
            </div>

            <div
              className={`chat-bubble text-white ${
                isSender
                  ? "chat-bubble-primary bg-[#4d7dfb]"
                  : "chat-bubble-secondary bg-gray-200 text-gray-700"
              }`}
            >
              <ReactMarkDown
                remarkPlugins={[remarkGfm]}
                className={`break-words`}
              >
                {message.content}
              </ReactMarkDown>
            </div>
          </div>
        );
      })}

      <div ref={ref} />
    </div>
  );
}

export default Messages;
