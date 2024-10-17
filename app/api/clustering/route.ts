import { NextRequest, NextResponse } from "next/server";
import { kmeans } from "ml-kmeans";

// Define our own interface for the kmeans result
interface KMeansResult {
  clusters: number[];
  centroids: number[][];
  iterations: number;
  converged: boolean;
}

export async function POST(req: NextRequest) {
  const { feedbacks } = await req.json();

  // Function to calculate Levenshtein distance
  function levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1)
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

  // Prepare data for clustering
  const data = feedbacks.map((feedback: string) =>
    feedbacks.map((other: string) => levenshteinDistance(feedback, other))
  );

  // Perform clustering
  const numClusters = Math.min(3, feedbacks.length); // Ensure we don't try to create more clusters than we have feedbacks
  const options = {
    iterations: 100,
    tolerance: 1e-6,
    withIterations: false,
    initialization: "kmeans++" as "kmeans++",
  };

  const result = kmeans(data, numClusters, options) as KMeansResult;

  // Format the results
  const clusteredQueries = Array.from({ length: numClusters }, (_, i) => ({
    cluster: `Cluster ${i + 1}`,
    feedbacks: feedbacks.filter(
      (_: any, index: number) => result.clusters[index] === i
    ),
  }));

  return NextResponse.json({ clusteredQueries });
}
