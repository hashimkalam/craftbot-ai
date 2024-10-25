"use client";

import Loading from "@/app/dashboard/loading";
import { GET_FEEDBACKS_BY_CHAT_SESSION_ID } from "@/graphql/mutation";
import {
  Feedback,
  FeedbackByChatSessionIdResponse,
  FeedbacksByChatSessionIdVariables,
} from "@/types/types";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState, Suspense, lazy } from "react";
import { Button } from "../ui/button";

const SentimentPieChart = lazy(() => import("./SentimentPieChart"));

function FeedbackSentimentCalc({
  feedbackData,
}: {feedbackData: Feedback[]}) {
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
    useLazyQuery<FeedbackByChatSessionIdResponse, FeedbacksByChatSessionIdVariables>(
      GET_FEEDBACKS_BY_CHAT_SESSION_ID
    );

  useEffect(() => {
    if (feedbackData) {
      const feedbackMap: { [key: number]: Feedback[] } = {};
      let totalNeutral = 0;
      let totalPositive = 0;
      let totalNegative = 0;

      // Assuming feedbackData is an array of feedbacks
      feedbackData.forEach((feedback) => {
        const sessionId = feedback.chat_session_id; // Adjust according to your data structure
        if (!feedbackMap[sessionId]) {
          feedbackMap[sessionId] = [];
        }
        feedbackMap[sessionId].push(feedback);

        // Count sentiment
        if (feedback.sender === "user") {
          if (feedback.sentiment === "NEUTRAL") totalNeutral++;
          else if (feedback.sentiment === "POSITIVE") totalPositive++;
          else if (feedback.sentiment === "NEGATIVE") totalNegative++;
        }
      });

      setFeedbackBySession(feedbackMap);
      setSentimentCount({
        NEUTRAL: totalNeutral,
        POSITIVE: totalPositive,
        NEGATIVE: totalNegative,
      });
    }
  }, [feedbackData]);

  const handleExport = () => {
    // Prepare the feedback data for export
    const exportData: {
      sessionId: string;
      content: string;
      sentiment: string;
      createdAt: string;
    }[] = [];

    Object.entries(feedbackBySession).forEach(([sessionId, feedbacks]) => {
      feedbacks.forEach((feedback) => {
        feedback.sender === "user" &&
          exportData.push({
            sessionId,
            content: feedback.content,
            sentiment: feedback.sentiment,
            createdAt: new Date(feedback.created_at).toLocaleString(),
          });
      });
    });

    // Convert to CSV format
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Session ID,Content,Sentiment,Created At",
        ...exportData.map(
          (row) =>
            `${row.sessionId},"${row.content}","${row.sentiment}","${row.createdAt}"`
        ),
      ].join("\n");

    // Create a download link and click it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedback_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  if (loadingFeedback)
    return (
      <div>
        <Loading />
      </div>
    );
  if (errorFeedback)
    return <div>Error fetching feedbacks: {errorFeedback.message}</div>;

  return (
    <>
      <div className="relative">
        <h1 className="text-xl font-bold underline ml-2">Feedback</h1>
        <Button
          onClick={handleExport}
          className="mb-4 bg-blue-500 text-white mx-4 my-2 rounded absolute top-0 right-0"
        >
          EXPORT
        </Button>
      </div>
      <Suspense fallback={<Loading />}>
        <SentimentPieChart
          neutral={sentimentCount.NEUTRAL}
          negative={sentimentCount.NEGATIVE}
          positive={sentimentCount.POSITIVE}
        />
      </Suspense>
    </>
  );
}

export default FeedbackSentimentCalc;
