"use client";

import { Message } from "@/types/types";
import { usePathname } from "next/navigation";

function Messages({
  messages,
  chatbotName,
}: {
  messages: Message[];
  chatbotName: string;
}) {
  // check path
  const path = usePathname();
  const isReviewPage = path.includes("review-sessions");


  console.log("messages: ", messages)
  console.log("chatbotname: ", chatbotName)

  return (
    <div>
      {messages.map((message) => {
        const isSender = message.sender === "user";
        console.log("message.sender: ", message.sender)
        return (
          <div
            key={message.id}
            className={`chat ${isSender ? "chat-start" : "chat-end"} relative`}
          >
            {!isReviewPage && (
              <p className="absolute -bottom-5 text-xs text-gray-300">
                {" "}
                sent {new Date(message.created_at).toLocaleString()}{" "}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Messages;
