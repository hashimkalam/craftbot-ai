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
import dayjs from "dayjs"; // Using dayjs for date manipulation

interface TotalTimeUsedPerDayProps {
  filteredSessions: ChatSession[];
}

const TotalTimeUsedPerDay = ({
  filteredSessions,
}: TotalTimeUsedPerDayProps) => {
  const [ids, setIds] = useState<number[]>([]);
  const [messagesBySession, setMessagesBySession] = useState<{
    [key: number]: Message[];
  }>({});

  const [fetchMessages, { loading, error }] = useLazyQuery<
    MessagesByChatSessionIdResponse,
    MessageByChatSessionIdVariables
  >(GET_MESSAGES_BY_CHAT_SESSION_ID);

  useEffect(() => {
    const sessionIds: number[] = filteredSessions.map((session) => session.id);
    setIds(sessionIds);
  }, [filteredSessions]);

  // Fetch messages for all chatIds
  useEffect(() => {
    const fetchAllMessages = async () => {
      if (ids.length > 0) {
        try {
          const allMessages = await Promise.all(
            ids.map(async (chatId) => {
              const { data } = await fetchMessages({
                variables: { chat_session_id: chatId },
              });
              return {
                chatId,
                messages: data?.chat_sessions?.messages || [],
              };
            })
          );

          // Convert to an object with session id as key
          const messageMap: { [key: number]: Message[] } = {};
          allMessages.forEach(({ chatId, messages }) => {
            messageMap[chatId] = messages;
          });

          setMessagesBySession(messageMap);
        } catch (error) {
          console.error("Error fetching messages: ", error);
        }
      }
    };

    fetchAllMessages();
  }, [ids, fetchMessages]); // Ensure that fetchMessages is in the dependency array

  // Calculate total time spent across all sessions
  const getTotalTimeSpent = () => {
    let totalSeconds = 0;

    Object.entries(messagesBySession).forEach(([sessionId, messages]) => {
      if (messages.length > 0) {
        // Sort messages by created_at
        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const firstMessageTime = dayjs(sortedMessages[0].created_at);
        const lastMessageTime = dayjs(
          sortedMessages[sortedMessages.length - 1].created_at
        );

        // Calculate difference in seconds
        const sessionDuration = lastMessageTime.diff(
          firstMessageTime,
          "second"
        );
        totalSeconds += sessionDuration;
      }
    });

    // Convert total seconds to minutes and remaining seconds
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return { totalMinutes, remainingSeconds };
  };

  const { totalMinutes, remainingSeconds } = getTotalTimeSpent();

  return (
    <div>
      <h2>
        Total Time Spent: <br />
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>
          {totalMinutes} minutes {remainingSeconds} seconds
        </p>
      )}
      {error && <p>Error fetching messages: {error.message}</p>}
    </div>
  );
};

export default TotalTimeUsedPerDay;
