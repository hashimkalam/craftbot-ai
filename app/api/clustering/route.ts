import { NextRequest, NextResponse } from "next/server";
import { kmeans } from "ml-kmeans";
import {
  RequestBody,
  ClusteredFeedback,
  CommonFeedbackResponse,
  KMeansResult,
} from "@/types/types";

const hfApiKey = process.env.HUGGING_FACE_API_TOKEN;

if (!hfApiKey) {
  throw new Error(
    "HUGGING_FACE_API_TOKEN is not defined in the environment variables"
  );
}

// Configuration with multiple model options in order of preference
const SUMMARIZATION_CONFIG = {
  models: [
    "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6", // Faster, lighter model
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",       // Fallback 1
    "https://api-inference.huggingface.co/models/google/pegasus-xsum"            // Fallback 2
  ],
  maxLength: 50,
  minLength: 5,
  maxAttempts: 2,        // Reduced attempts per model
  retryDelay: 500,       // Reduced delay between attempts
  timeout: 30000,        // 30 second timeout
} as const;

// Helper function to truncate long texts
const truncateText = (text: string, maxLength: number = 500): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Enhanced summarization function with multiple model fallbacks
const summarizeText = async (text: string): Promise<string> => {
  const truncatedText = truncateText(text);
  
  for (const modelUrl of SUMMARIZATION_CONFIG.models) {
    for (let attempt = 1; attempt <= SUMMARIZATION_CONFIG.maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SUMMARIZATION_CONFIG.timeout);

        const response = await fetch(modelUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: truncatedText,
            parameters: {
              max_length: SUMMARIZATION_CONFIG.maxLength,
              min_length: SUMMARIZATION_CONFIG.minLength,
              do_sample: false,
              temperature: 0.3,     // Reduced for more focused output
              num_beams: 2,         // Reduced for speed
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (response.ok) {
          return result[0].summary_text;
        }

        if (result.error?.includes("loading") || result.error?.includes("busy")) {
          console.log(`Model ${modelUrl} busy/loading, attempt ${attempt}`);
          await new Promise(resolve => setTimeout(resolve, SUMMARIZATION_CONFIG.retryDelay));
          continue;
        }

        throw new Error(JSON.stringify(result));
      } catch (error) {
        if (error === 'AbortError') {
          console.log(`Timeout reached for model ${modelUrl}, trying next option...`);
          break; // Try next model immediately on timeout
        }
        
        if (attempt === SUMMARIZATION_CONFIG.maxAttempts) {
          console.log(`All attempts failed for model ${modelUrl}, trying next option...`);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, SUMMARIZATION_CONFIG.retryDelay));
      }
    }
  }

  // If all models fail, return a processed version of the original text
  return truncateText(text, SUMMARIZATION_CONFIG.maxLength)
    .split('.')[0] + '.'; // Return first sentence as fallback
};

// Modified clustering logic to process in smaller batches
const processFeedbackBatch = async (
  feedbacks: string[], 
  result: KMeansResult, 
  clusterIndex: number
): Promise<ClusteredFeedback> => {
  const clusterFeedbacks = feedbacks.filter(
    (_, index) => result.clusters[index] === clusterIndex
  );
  
  const clusterFeedbacksText = clusterFeedbacks.join("\n");
  let summary: string;

  if (clusterFeedbacksText.length < 50) {
    summary = "Insufficient content for summarization";
  } else {
    try {
      summary = await summarizeText(clusterFeedbacksText);
    } catch (error) {
      console.error(`Error summarizing cluster ${clusterIndex + 1}:`, error);
      summary = truncateText(clusterFeedbacksText, 50); // Fallback to truncation
    }
  }

  return {
    cluster: `Cluster ${clusterIndex + 1}`,
    feedbacks: clusterFeedbacks,
    feedbackSummarize: summary,
  };
};

export async function POST(req: NextRequest) {
  try {
    const { feedbacks }: RequestBody = await req.json();

    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: feedbacks should be a non-empty array." },
        { status: 400 }
      );
    }

    // Distance matrix calculation
    const numFeedbacks = feedbacks.length;
    const data: number[][] = Array.from({ length: numFeedbacks }, (_, i) =>
      feedbacks.map((_, j) => {
        const a = feedbacks[i];
        const b = feedbacks[j];
        // Simple distance calculation for speed
        return Math.abs(a.length - b.length) + 
               Math.abs(new Set(a.split(' ')).size - new Set(b.split(' ')).size);
      })
    );

    const minCluster = Math.max(2, Math.round(numFeedbacks * 0.25));
    const numClusters = Math.min(minCluster, numFeedbacks);

    const result = kmeans(data, numClusters, {
      maxIterations: 100,    // Reduced iterations
      tolerance: 1e-1,    // Increased tolerance 
      initialization: "kmeans++",
    }) as KMeansResult;

    // Process clusters in batches
    const batchSize = 3; // Process 3 clusters at a time
    const clusteredFeedbacks: ClusteredFeedback[] = [];
    
    for (let i = 0; i < numClusters; i += batchSize) {
      const batch = await Promise.all(
        Array.from({ length: Math.min(batchSize, numClusters - i) }, (_, j) =>
          processFeedbackBatch(feedbacks, result, i + j)
        )
      );
      clusteredFeedbacks.push(...batch);
    }

    return NextResponse.json({
      clusteredQueries: clusteredFeedbacks,
    } as CommonFeedbackResponse);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { 
        error: "An error occurred while processing the request.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}