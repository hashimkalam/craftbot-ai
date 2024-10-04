"use client";

import { useState } from "react";
import Messages from "@/components/Messages";
import { Feedback, Message } from "@/types/types";
import ReviewSessionMode from "./ReviewSessionMode";

function MessagesContainer({
  messages,
  feedbacks,
  chatbotName,
}: {
  messages: Message[];
  feedbacks: Feedback[];
  chatbotName: string;
}) {
  const [mode, setMode] = useState(0); // state is client-side

  
  console.log("messages(MessagesContainer): ", messages)
  console.log("feedbacks(MessagesContainer): ", feedbacks)
 
  return (
    <div className="h-full">
      <ReviewSessionMode mode={mode} setMode={setMode} />

      <Messages
        messages={messages}
        feedbacks={feedbacks}
        chatbotName={chatbotName}
        mode={mode} // Use the mode to determine whether to show messages or feedback
      />
    </div>
  );
}

export default MessagesContainer;
