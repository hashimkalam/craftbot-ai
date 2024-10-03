"use client";

import { useState } from "react";
import Messages from "@/components/Messages"; 
import { Feedback, Message } from "@/types/types";
import ReviewSessionMode from "./ReviewSessionMode";

function MessagesContainer({
  messages,
  feedback,
  chatbotName,
}: {
  messages: Message[];
  feedback: Feedback[];
  chatbotName: string;
}) {
  const [mode, setMode] = useState(0); // This state is client-side

  return (
    <div className="h-full"> 
      <ReviewSessionMode mode={mode} setMode={setMode} />

      {/* Pass mode to Messages */}
      <Messages
        messages={messages}
        feedback={feedback}
        chatbotName={chatbotName}
        mode={mode} // Use the mode to determine whether to show messages or feedback
      />
      
    </div>
  );
}

export default MessagesContainer;
