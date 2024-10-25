"use client";
import Loading from "@/app/dashboard/loading";
import {
  ChatSession,
  ClusteredFeedback,
  CommonFeedbackResponse,
  Feedback,
} from "@/types/types";
import React, { useEffect, useState } from "react";

function CommonFeedback({ 
  feedbackData,
}: { 
  feedbackData: Feedback[];
}) {
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

  // Step 1: Process feedback data
  useEffect(() => {
    const positiveFeedbackArray: string[] = [];
    const negativeFeedbackArray: string[] = [];
    const neutralFeedbackArray: string[] = [];

    feedbackData.forEach((feedback) => {
      if (feedback.sender === "user") {
        if (feedback.sentiment === "POSITIVE") {
          positiveFeedbackArray.push(feedback.content);
        } else if (feedback.sentiment === "NEGATIVE") {
          negativeFeedbackArray.push(feedback.content);
        } else if (feedback.sentiment === "NEUTRAL") {
          neutralFeedbackArray.push(feedback.content);
        }
      }
    });

    // Save both positive and negative feedback into combined state
    setFeedbackSentiment({
      positive: positiveFeedbackArray,
      negative: negativeFeedbackArray,
      neutral: neutralFeedbackArray,
    });
  }, [feedbackData]);

  // Step 2: Submit feedbacks for clustering
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
        return a.length - b.length;
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

  // Step 3: Filter common feedbacks with more than 2 items
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
