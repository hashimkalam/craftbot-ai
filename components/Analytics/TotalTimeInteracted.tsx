"use client";

import { Message } from "@/types/types";
import { useState, useEffect } from "react"; 

const TotalTimeInteracted = ({ messageData }: { messageData: Message[] }) => {
  const [messagesBySession, setMessagesBySession] = useState<{
    [key: number]: Message[];
  }>({});

  // Group messages by session and set them in state
  useEffect(() => {
    const messageMap: { [key: number]: Message[] } = {};

    messageData.forEach((message) => {
      if (!messageMap[message.chat_session_id]) {
        messageMap[message.chat_session_id] = [];
      }
      messageMap[message.chat_session_id].push(message);
    });

    setMessagesBySession(messageMap);
  }, [messageData]);

  // Function to calculate the total time spent across all sessions
  const getTotalTimeSpent = () => {
    let totalSeconds = 0;

    // Loop through each session's messages
    Object.values(messagesBySession).forEach((messages) => {
      if (messages.length > 1) {
        // Sort messages by their creation time
        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        let sessionTime = 0;
        const threshold = 1.15 * 60 * 1000; // 5 minutes in milliseconds

        // Calculate the interaction time by summing time gaps between consecutive messages
        for (let i = 1; i < sortedMessages.length; i++) {
          const currentMessageTime = new Date(sortedMessages[i].created_at).getTime();
          const previousMessageTime = new Date(sortedMessages[i - 1].created_at).getTime();
          const timeDiff = currentMessageTime - previousMessageTime;

          // Only count time differences that are less than or equal to the threshold
          if (timeDiff <= threshold) {
            sessionTime += timeDiff;
          }
        }

        // Convert session time to seconds and add to the total
        totalSeconds += sessionTime / 1000;
      }
    });

    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);

    return { totalMinutes, remainingSeconds };
  };

  const { totalMinutes, remainingSeconds } = getTotalTimeSpent();

  return (
    <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-4 w-full flex flex-col items-center justify-center space-y-2">
      <h1 className="text-md font-medium text-gray-600 dark:text-gray-300">
        Approx Total Time Spent:
      </h1>

      <p className="text-5xl font-extrabold text-primary dark:text-white tracking-wider text-center">
        {totalMinutes} min {remainingSeconds} secs
      </p>
    </div>
  );
};

export default TotalTimeInteracted;
