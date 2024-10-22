"use client";
import Loading from "@/app/dashboard/loading";
import { GET_FEEDBACKS_BY_CHAT_SESSION_ID } from "@/graphql/mutation";
import {
  ChatSession,
  ClusteredFeedback,
  CommonFeedbackResponse,
  Feedback,
  FeedbackByChatSessionIdResponse,
  FeedbacksByChatSessionIdVariables,
} from "@/types/types";
import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";

function CommonFeedback({
  filteredSessions,
}: {
  filteredSessions: ChatSession[];
}) {
  const [ids, setIds] = useState<number[]>([]);
  const [feedbackBySession, setFeedbackBySession] = useState<{
    [key: number]: Feedback[];
  }>({});
  const [commonFeedbackPositive, setCommonFeedbackPositive] = useState<
    ClusteredFeedback[]
  >([]);
  const [commonFeedbackNegative, setCommonFeedbackNegative] = useState<
    ClusteredFeedback[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSentiment, setFeedbackSentiment] = useState<{
    positive: string[];
    negative: string[];
    neutral: string[];
  }>({
    positive: [],
    negative: [],
    neutral: [],
  });

  const [
    fetchFeedback,
    { loading: loadingFeedback, data, error: errorFeedback },
  ] = useLazyQuery<
    FeedbackByChatSessionIdResponse,
    FeedbacksByChatSessionIdVariables
  >(GET_FEEDBACKS_BY_CHAT_SESSION_ID, {
    fetchPolicy: "cache-first", // Use cached data first
  });

  // Step 1: Extract session IDs
  useEffect(() => {
    const sessionIds: number[] = filteredSessions.map((session) => session.id);
    setIds(sessionIds);
  }, [filteredSessions]);

  // Step 2: Fetch feedbacks for all session IDs
  useEffect(() => {
    const fetchAllData = async () => {
      if (ids.length > 0) {
        setLoading(true);
        try {
          const allFeedbacks = await Promise.all(
            ids.map(async (chatId) => {
              const { data } = await fetchFeedback({
                variables: { chat_session_id: chatId },
              });

              // Filter feedback where the sender is 'user'
              const userFeedbacks =
                data?.chat_sessions?.feedbacks.filter(
                  (feedback) => feedback.sender === "user"
                ) || [];

              // Return the chatId and filtered user feedbacks
              return {
                chatId,
                feedback: userFeedbacks,
              };
            })
          );

          // Build feedback map and separate positive/negative feedback
          const feedbackMap: { [key: number]: Feedback[] } = {};
          const positiveFeedbackArray: string[] = [];
          const negativeFeedbackArray: string[] = [];
          const neutralFeedbackArray: string[] = [];

          allFeedbacks.forEach(({ chatId, feedback }) => {
            // Save feedback by session
            feedbackMap[chatId] = feedback;

            // Extract positive and negative feedback content
            feedback.forEach((fb) => {
              if (fb.sentiment === "POSITIVE") {
                positiveFeedbackArray.push(fb.content);
              } else if (fb.sentiment === "NEGATIVE") {
                negativeFeedbackArray.push(fb.content);
              } else if (fb.sentiment === "NEUTRAL") {
                neutralFeedbackArray.push(fb.content);
              }
            });
          });

          // Set feedback by session into state
          setFeedbackBySession(feedbackMap);

          // Save both positive and negative feedback into combined state
          setFeedbackSentiment({
            positive: positiveFeedbackArray,
            negative: negativeFeedbackArray,
            neutral: neutralFeedbackArray,
          });
        } catch (error) {
          console.error("Error fetching data: ", error);
          setError("Error fetching feedbacks.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllData();
  }, [ids, fetchFeedback]);

  // Step 3: Submit feedbacks for clustering
  async function submitFeedback(
    feedbackArray: string[],
    type: "positive" | "negative"
  ) {
    setLoading(true);
    setError(null);

    try {
      // Sort feedback array before sending
      const sortedFeedbackArray = feedbackArray.sort((a, b) => {
        // Example: Sort by length of feedback (ascending)
        return a.length - b.length; // Change this logic based on your sorting requirement
      });

      const response = await fetch("/api/clustering", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbacks: sortedFeedbackArray }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred");
      }

      const data: CommonFeedbackResponse = await response.json();
      console.log("data: ", data);
      if (type === "positive") {
        setCommonFeedbackPositive(data.clusteredQueries);
      } else {
        setCommonFeedbackNegative(data.clusteredQueries);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  // Submit positive and negative feedback arrays on mount
  useEffect(() => {
    if (feedbackSentiment.positive.length > 0) {
      submitFeedback(feedbackSentiment.positive, "positive");
    }
    if (feedbackSentiment.negative.length > 0) {
      submitFeedback(feedbackSentiment.negative, "negative");
    }
  }, [feedbackSentiment]);

  // Step 4: Filter common feedbacks with more than 2 items
  const filteredCommonFeedbackPositive = commonFeedbackPositive.filter(
    (item) => item.feedbacks && item.feedbacks.length > 2
  );
  const filteredCommonFeedbackNegative = commonFeedbackNegative.filter(
    (item) => item.feedbacks && item.feedbacks.length > 2
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-white dark:bg-primary/20 p-4 shadow-lg rounded-xl h-fit w-full ">
            <h2 className="text-xl font-bold">Most Common Positive Feedback</h2>
            {/* Display filtered positive feedback */}
            {filteredCommonFeedbackPositive.length > 0 ? (
              <ul>
                {filteredCommonFeedbackPositive.map((item, index) => (
                  <li key={index}>
                    <strong>{item.cluster}</strong>
                    <ul>
                      {item.feedbacks.map((feedback, feedbackIndex) => (
                        <li key={feedbackIndex}>{feedback}</li>
                      ))}
                    </ul>
                    {/* Display summarized feedback if available */}
                    {item?.feedbackSummarize && (
                      <p className="text-gray-500 mt-2">
                        <strong>Summary: </strong>
                        {item.feedbackSummarize}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not Enough Feedbacks (at least 3)</p>
            )}
          </div>
          <div className="bg-white dark:bg-primary/20 p-4 shadow-lg rounded-xl h-fit w-full ">
            <h2 className="text-xl font-bold">Most Common Negative Feedback</h2>
            {/* Display filtered negative feedback */}
            {filteredCommonFeedbackNegative.length > 0 ? (
              <ul>
                {filteredCommonFeedbackNegative.map((item, index) => (
                  <li key={index}>
                    <strong>{item.cluster}</strong>
                    <ul>
                      {item.feedbacks.map((feedback, feedbackIndex) => (
                        <li key={feedbackIndex}>{feedback}</li>
                      ))}
                    </ul>
                    {/* Display summarized feedback if available */}
                    {item.feedbackSummarize && (
                      <p className="text-gray-500 mt-2">
                        <strong>Summary: </strong>
                        {item.feedbackSummarize}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not Enough Feedbacks (at least 3)</p>
            )}
          </div>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </>
  );
}

export default CommonFeedback;
