"use client";

import { GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/mutation";
import {
  ChatSession,
  Message,
  MessageByChatSessionIdVariables,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Loading from "@/app/dashboard/loading";

interface TotalTimeUsedPerDayProps {
  filteredSessions: ChatSession[];
  handleTotalMessages: (count: number) => void;
}

const TotalTimeUsedPerDay = ({
  filteredSessions,
  handleTotalMessages,
}: TotalTimeUsedPerDayProps) => {
  const [ids, setIds] = useState<number[]>([]);
  const [messagesBySession, setMessagesBySession] = useState<{
    [key: number]: Message[];
  }>({});

  const [fetchMessages, { loading: loadingMessages, error: errorMessages }] =
    useLazyQuery<
      MessagesByChatSessionIdResponse,
      MessageByChatSessionIdVariables
    >(GET_MESSAGES_BY_CHAT_SESSION_ID);

  useEffect(() => {
    const sessionIds: number[] = filteredSessions.map((session) => session.id);
    setIds(sessionIds);
  }, [filteredSessions]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (ids.length > 0) {
        try {
          const allMessages = await Promise.all(
            ids.map(async (chatId) => {
              const { data: messageData } = await fetchMessages({
                variables: { chat_session_id: chatId },
              });
              console.log("messageData: ", messageData); // Log message data

              return {
                chatId,
                messages: messageData?.chat_sessions?.messages || [],
              };
            })
          );

          const messageMap: { [key: number]: Message[] } = {};

          allMessages.forEach(({ chatId, messages }) => {
            messageMap[chatId] = messages;
          });

          setMessagesBySession(messageMap);

          const totalMessageCount = allMessages.reduce(
            (count, { messages }) => count + messages.length,
            0
          );

          handleTotalMessages(totalMessageCount);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };

    fetchAllData();
  }, [ids, fetchMessages, handleTotalMessages]);

  const getTotalTimeSpent = () => {
    let totalSeconds = 0;

    Object.entries(messagesBySession).forEach(([sessionId, messages]) => {
      if (messages.length > 0) {
        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const firstMessageTime = dayjs(sortedMessages[0].created_at);
        const lastMessageTime = dayjs(
          sortedMessages[sortedMessages.length - 1].created_at
        );

        const sessionDuration = lastMessageTime.diff(
          firstMessageTime,
          "second"
        );
        totalSeconds += sessionDuration;
      }
    });

    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return { totalMinutes, remainingSeconds };
  };

  const { totalMinutes, remainingSeconds } = getTotalTimeSpent();

  return (
    <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-4 w-full flex flex-col items-center justify-center space-y-2">
      <h2 className="text-md font-medium text-gray-600 dark:text-gray-300">
        <h2>Total Time Spent:</h2>
      </h2>

      {loadingMessages ? (
        <Loading />
      ) : (
        <p className="text-5xl font-extrabold text-primary dark:text-white tracking-wider text-center">
          {totalMinutes} min {remainingSeconds} secs
        </p>
      )}

      {errorMessages && <p>Error fetching messages: {errorMessages.message}</p>}
    </div>
  );
};

export default TotalTimeUsedPerDay;
