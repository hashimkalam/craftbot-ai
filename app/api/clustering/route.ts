import { NextRequest, NextResponse } from "next/server";
import { kmeans } from "ml-kmeans";
import {
  RequestBody,
  ClusteredFeedback,
  CommonFeedbackResponse,
  KMeansResult,
} from "@/types/types";
// import { summarizeText } from "@/utils/summarizer";

export async function POST(req: NextRequest) {
  try {
    const { feedbacks }: RequestBody = await req.json();

    // Validate the input feedbacks
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: feedbacks should be a non-empty array." },
        { status: 400 }
      );
    }

    // Function to calculate Levenshtein distance
    function levenshteinDistance(a: string, b: string): number {
      const matrix: number[][] = Array(b.length + 1)
        .fill(null)
        .map(() => Array(a.length + 1).fill(null));

      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + indicator
          );
        }
      }

      return matrix[b.length][a.length];
    }

    // Prepare the distance matrix for clustering
    const numFeedbacks = feedbacks.length;
    const data: number[][] = Array.from({ length: numFeedbacks }, (_, i) =>
      feedbacks.map((_, j) => levenshteinDistance(feedbacks[i], feedbacks[j]))
    );

    // Perform clustering
    const numClusters = Math.min(5, numFeedbacks); // Ensure we don't create more clusters than we have feedbacks
    const options = {
      iterations: 300,
      tolerance: 1e-2,
      withIterations: false,
      initialization: "kmeans++" as "kmeans++", // You may consider a fixed initialization method
    };

    const result = kmeans(data, numClusters, options) as KMeansResult;

    // Format the results
    const clusteredFeedbacks: ClusteredFeedback[] = Array.from(
      { length: numClusters },
      (_, i) => ({
        cluster: `Cluster ${i + 1}`,
        feedbacks: feedbacks.filter((_, index) => result.clusters[index] === i),
      })
    );

    // Summarize the feedback in each cluster
    /* for (const cluster of clusteredFeedbacks) {
      const clusterFeedbacks = cluster.feedbacks;
      const clusterFeedbacksText = clusterFeedbacks.join("\n");

      // Ensure no cluster has too little text for summarization
      if (clusterFeedbacksText.length < 50) {
        cluster.feedbackSummarize = "Not enough content to summarize";
      } else {
        try {
          const clusterFeedbackSummary = await summarizeText(
            clusterFeedbacksText
          );
          cluster.feedbackSummarize = clusterFeedbackSummary;
        } catch (error) {
          cluster.feedbackSummarize = "Error summarizing cluster feedback.";
          console.error("Error summarizing cluster:", error);
        }
      }
    } */

    // Return the response using the expected `CommonFeedbackResponse` format
    return NextResponse.json({
      clusteredQueries: clusteredFeedbacks,
    } as CommonFeedbackResponse);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}
