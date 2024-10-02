"use client";

import { Feedback, Message } from "@/types/types";
import { usePathname } from "next/navigation";
import logo from "@/public/images/just_logo.png";
import { UserCircle } from "lucide-react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import Image from "next/image";

function Messages({
  messages,
  feedback = [],
  chatbotName,
  mode,
}: {
  messages?: Message[];
  feedback?: Feedback[];
  chatbotName?: string;
  mode?: number; // 0 for messages, 1 for feedback
}) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const isReviewPage = path.includes("review-sessions");

  // Log feedback data for debugging
  console.log("Feedback Data: ", feedback);

  // Set allMessages based on the mode, ensuring it's always an array
  const allMessages: Message[] =
    mode === 0
      ? messages || [] // Use messages when mode is 0, fallback to an empty array if undefined
      : feedback?.map((item) => ({
          id: item.chat_session_id || 0, // Ensure chat_session_id is provided, or default to 0
          content: item.content,
          created_at: item.created_at,
          chat_session_id: item.chat_session_id || 0, // Use chat_session_id from feedback
          sender: "ai", // Assuming sender is always 'ai' for feedback items
        })) || []; // Use feedback when mode is 1, fallback to an empty array if undefined

  console.log("Messages: ", allMessages);
  console.log("Chatbot Name: ", chatbotName);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-10 py-10 px-5 bg-white rounded-lg">
      {allMessages.length === 0 ? (
        <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
      ) : (
        allMessages.map((message) => {
          const isSender = message.sender !== "user";
          console.log("Message Sender: ", message.sender);
          return (
            <div
              key={message.id}
              className={`chat ${isSender ? "chat-start" : "chat-end"} relative`}
            >
              {!isReviewPage && (
                <p className="absolute -bottom-5 text-xs text-gray-300">
                  Sent {new Date(message.created_at).toLocaleString()}
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
                  className="break-words"
                >
                  {message.content}
                </ReactMarkDown>
              </div>
            </div>
          );
        })
      )}

      <div ref={ref} />
    </div>
  );
}

export default Messages;
