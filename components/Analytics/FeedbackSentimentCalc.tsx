"use client";

import Loading from "@/app/dashboard/loading";
import { GET_FEEDBACKS_BY_CHAT_SESSION_ID } from "@/graphql/mutation";
import {
  ChatSession,
  Feedback,
  FeedbackByChatSessionIdResponse,
  FeedbacksByChatSessionIdVariables,
} from "@/types/types";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState, Suspense, lazy } from "react";

const SentimentPieChart = lazy(() => import("./SentimentPieChart"));

interface TotalTimeUsedPerDayProps {
  filteredSessions: ChatSession[];
  handleTotalFeedback: (count: number) => void;
}

function FeedbackSentimentCalc({
  filteredSessions,
  handleTotalFeedback,
}: TotalTimeUsedPerDayProps) {
  const [ids, setIds] = useState<number[]>([]);
  const [feedbackBySession, setFeedbackBySession] = useState<{
    [key: number]: Feedback[];
  }>({});

  // State to store the total counts for each sentiment
  const [sentimentCount, setSentimentCount] = useState({
    NEUTRAL: 0,
    POSITIVE: 0,
    NEGATIVE: 0,
  });

  const [fetchFeedback, { loading: loadingFeedback, error: errorFeedback }] =
    useLazyQuery<
      FeedbackByChatSessionIdResponse,
      FeedbacksByChatSessionIdVariables
    >(GET_FEEDBACKS_BY_CHAT_SESSION_ID);

  useEffect(() => {
    const sessionIds: number[] = filteredSessions.map((session) => session.id);
    setIds(sessionIds);
    console.log("Filtered Session IDs: ", sessionIds); // Log session IDs
  }, [filteredSessions]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (ids.length > 0) {
        console.log("Fetching feedbacks for IDs: ", ids); // Log IDs before fetching data
        try {
          const allFeedbacks = await Promise.all(
            ids.map(async (chatId) => {
              const { data: feedbackData } = await fetchFeedback({
                variables: { chat_session_id: chatId },
              });
              console.log(
                `Feedback Data for Chat ID ${chatId}: `,
                feedbackData
              ); // Log feedback data for each ID

              return {
                chatId,
                feedback: feedbackData?.chat_sessions?.feedbacks || [],
              };
            })
          );

          const feedbackMap: { [key: number]: Feedback[] } = {};
          let totalNeutral = 0;
          let totalPositive = 0;
          let totalNegative = 0;

          allFeedbacks.forEach(({ chatId, feedback }) => {
            feedbackMap[chatId] = feedback;

            // Log feedbacks collected for each session
            console.log(`Collected Feedback for Chat ID ${chatId}: `, feedback);

            // Count the number of feedbacks for each sentiment
            feedback.forEach((fb) => {
              if (fb.sender === "user") {
                if (fb.sentiment === "NEUTRAL") totalNeutral++;
                else if (fb.sentiment === "POSITIVE") totalPositive++;
                else if (fb.sentiment === "NEGATIVE") totalNegative++;
              }
            });
          });

          setFeedbackBySession(feedbackMap);
          console.log("Feedback by Session: ", feedbackMap); // Log feedbacks mapped by session ID

          // Update the state with the total count for each sentiment
          setSentimentCount({
            NEUTRAL: totalNeutral,
            POSITIVE: totalPositive,
            NEGATIVE: totalNegative,
          });
          console.log("Sentiment Count: ", {
            NEUTRAL: totalNeutral,
            POSITIVE: totalPositive,
            NEGATIVE: totalNegative,
          }); // Log sentiment counts

          const totalFeedbackCount = allFeedbacks.reduce(
            (count, { feedback }) => count + feedback.length,
            0
          );

          console.log("Total Feedback Count: ", totalFeedbackCount); // Log total feedback count
          handleTotalFeedback(totalFeedbackCount);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };

    fetchAllData();
  }, [ids, fetchFeedback, handleTotalFeedback]);

  return (
    <div>
      {/* Render Feedback */}
      {/* <div>
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

            {loadingFeedback && <p>Loading feedback...</p>}
            {errorFeedback && (
              <p>Error fetching feedback: {errorFeedback.message}</p>
            )}
          </div>
        ))}
      </div>
      */}

      <Suspense fallback={<Loading />}>
        <SentimentPieChart
          neutral={sentimentCount.NEUTRAL}
          negative={sentimentCount.NEGATIVE}
          positive={sentimentCount.POSITIVE}
        />
      </Suspense>
    </div>
  );
}

export default FeedbackSentimentCalc;
