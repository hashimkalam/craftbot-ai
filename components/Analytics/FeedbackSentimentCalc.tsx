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
import { Button } from "../ui/button";

// import { CiExport } from "react-icons/ci";

const SentimentPieChart = lazy(() => import("./SentimentPieChart"));

interface FeedbackSentimentCalcProps {
  filteredSessions: ChatSession[];
  handleTotalFeedback: (count: number) => void;
}

function FeedbackSentimentCalc({
  filteredSessions,
  handleTotalFeedback,
}: FeedbackSentimentCalcProps) {
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

          const totalFeedbackCount =
            totalNeutral + totalNegative + totalPositive;

          console.log("Total Feedback Count: ", totalFeedbackCount); // Log total feedback count
          handleTotalFeedback(totalFeedbackCount);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };

    fetchAllData();
  }, [ids, fetchFeedback, handleTotalFeedback]);

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

  return (
    <>
      <div className="relative">
        <h1 className="text-xl font-bold underline ml-2">Feedback</h1>
        <Button
          onClick={handleExport}
          className="mb-4 bg-blue-500 text-white mx-4 my-2 rounded absolute top-0 right-0"
        >
          {/*<CiExport size={24} />*/}
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
