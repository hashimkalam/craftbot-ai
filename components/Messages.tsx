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
  messages = [],
  feedbacks = [],
  chatbotName,
  mode = 0, // Default to message mode
}: {
  messages?: Message[];
  feedbacks?: Feedback[];
  chatbotName?: string;
  mode?: number; // 0 for messages, 1 for feedback
}) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const isReviewPage = path.includes("review-sessions");

  console.log("Messages Data(Messages): ", messages);
  console.log("Feedback Data(Messages): ", feedbacks);

  // Function to render individual message or feedback item
  const renderItem = (item: Message | Feedback, isMessage: boolean) => {
    console.log("item(Messages): ", item);
    // Check if item is null or undefined
    if (!item) {
      return null;
    }

    const isSender = item?.sender !== "user";
    const content = isMessage
      ? (item as Message).content
      : (item as Feedback).content;

    return (
      <div
        key={item.id}
        className={`chat ${isSender ? "chat-start" : "chat-end"} relative`}
      >
        {!isReviewPage && (
          <p className="absolute -bottom-5 text-xs text-gray-300">
            Sent {new Date(item.created_at).toLocaleString()}
          </p>
        )}

        <div className={`chat-image avatar w-10 ${!isSender && "-mr-4"}`}>
          {isSender ? (
            <Image src={logo} alt="Logo" className="h-12 w-12" />
          ) : (
            <UserCircle className="text-primary" />
          )}
        </div>

        <div
          className={`chat-bubble text-white ${
            isSender
              ? "chat-bubble-primary bg-primary"
              : "chat-bubble-secondary bg-primary/60 text-gray-700"
          }`}
        >
          <ReactMarkDown remarkPlugins={[remarkGfm]} className="break-words">
            {content}
          </ReactMarkDown>
        </div>
      </div>
    );
  };

  // Effect for scrolling to the bottom of the message list
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, feedbacks]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-10 py-10 px-5 bg-white dark:bg-primary-DARK">
      {mode === 0 && messages.length === 0 && (
        <p className="text-gray-500 text-center">
          No messages yet. Start the conversation!
        </p>
      )}

      {mode === 1 && feedbacks.length === 0 && (
        <p className="text-gray-500 text-center">No feedback yet.</p>
      )}

      {mode === 0 && messages.map((message) => renderItem(message, true))}
      {mode === 1 && feedbacks.map((feedback) => renderItem(feedback, false))}

      <div ref={ref} />
    </div>
  );
}

export default Messages;
