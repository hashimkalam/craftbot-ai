"use client";

import {
  GET_MESSAGES_BY_CHAT_SESSION_ID,
  GET_FEEDBACK_BY_CHAT_SESSION_ID,
} from "@/graphql/mutation";
import {
  ChatSession,
  Message,
  Feedback,
  MessageByChatSessionIdVariables,
  MessagesByChatSessionIdResponse,
  FeedbackByChatSessionIdResponse,
  FeedbackByChatSessionIdVariables,
} from "@/types/types";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

interface TotalTimeUsedPerDayProps {
  filteredSessions: ChatSession[];
  handleTotalMessages: (count: number) => void;
  handleTotalFeedback: (count: number) => void;
}

const TotalTimeUsedPerDay = ({
  filteredSessions,
  handleTotalMessages,
  handleTotalFeedback,
}: TotalTimeUsedPerDayProps) => {
  const [ids, setIds] = useState<number[]>([]);
  const [messagesBySession, setMessagesBySession] = useState<{
    [key: number]: Message[];
  }>({});
  const [feedbackBySession, setFeedbackBySession] = useState<{
    [key: number]: Feedback[];
  }>({});

  const [fetchMessages, { loading: loadingMessages, error: errorMessages }] =
    useLazyQuery<MessagesByChatSessionIdResponse, MessageByChatSessionIdVariables>(
      GET_MESSAGES_BY_CHAT_SESSION_ID
    );

  const [fetchFeedback, { loading: loadingFeedback, error: errorFeedback }] =
    useLazyQuery<FeedbackByChatSessionIdResponse, FeedbackByChatSessionIdVariables>(
      GET_FEEDBACK_BY_CHAT_SESSION_ID
    );

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
              
              const { data: feedbackData } = await fetchFeedback({
                variables: { chat_session_id: chatId },
              });
              console.log("feedbackData: ", feedbackData); // Log feedback data
    
              return {
                chatId,
                messages: messageData?.chat_sessions?.messages || [],
                feedback: feedbackData?.chat_sessions?.feedbacks || [],
              };
            })
          );
    
          const messageMap: { [key: number]: Message[] } = {};
          const feedbackMap: { [key: number]: Feedback[] } = {};
    
          allMessages.forEach(({ chatId, messages, feedback }) => {
            messageMap[chatId] = messages;
            feedbackMap[chatId] = feedback;
          });
    
          setMessagesBySession(messageMap);
          setFeedbackBySession(feedbackMap);
    
          const totalMessageCount = allMessages.reduce(
            (count, { messages }) => count + messages.length,
            0
          );
          const totalFeedbackCount = allMessages.reduce(
            (count, { feedback }) => count + feedback.length,
            0
          );
    
          handleTotalMessages(totalMessageCount);
          handleTotalFeedback(totalFeedbackCount);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };
    

    fetchAllData();
  }, [
    ids,
    fetchMessages,
    fetchFeedback,
    handleTotalMessages,
    handleTotalFeedback,
  ]);

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

  console.log("feedbackBySession: ", feedbackBySession)

  return (
    <div>
      <h2>
        Total Time Spent: <br />
      </h2>
      {loadingMessages ? (
        <p>Loading messages...</p>
      ) : (
        <p>
          {totalMinutes} minutes {remainingSeconds} seconds
        </p>
      )}
      {errorMessages && <p>Error fetching messages: {errorMessages.message}</p>}
      {loadingFeedback && <p>Loading feedback...</p>}
      {errorFeedback && <p>Error fetching feedback: {errorFeedback.message}</p>}

      {/* Render Feedback */}
      <div>
        <h3>Feedback:</h3>
        {Object.entries(feedbackBySession).map(([sessionId, feedbacks]) => (
          <div key={sessionId}>
            <h4>Chat Session ID: {sessionId}</h4>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div key={feedback.id}>
                  <p>
                    <strong>Content:</strong> {feedback.content}
                  </p>
                  <p>
                    <strong>Sentiment:</strong> {feedback.sentiment}
                  </p>
                  <p>
                    <strong>Created at:</strong>{" "}
                    {new Date(feedback.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No feedback available for this session.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalTimeUsedPerDay;
