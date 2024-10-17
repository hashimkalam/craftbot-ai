import React, { useEffect, useState } from "react";

function CommonFeedback() {
  const [commonFeedback, setCommonFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default feedback array
  const feedbacks = [
    "price is too high",
    "please half the price?",
    "price doesn't seem reasonable",
    "shipping is too slow",
    "refund my order",
    "how much does shipping cost?",
    "your prices are expensive",
    "customer service is unhelpful",
    "support team didn't resolve my issue",
    "customer service takes too long to respond",
    "rude customer support agents",
    "no one from customer service is responding",
    "poor communication from customer service",
  ];

  // Function to submit feedback
  async function submitFeedback(feedbackArray: string[]) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clustering", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbacks: feedbackArray }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred");
      }

      const data = await response.json();
      setCommonFeedback(data.clusteredQueries);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    submitFeedback(feedbacks);
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {commonFeedback.length > 0 && (
        <ul>
          {commonFeedback.map((item: any, index: number) => (
            <li key={index}>
              <strong>{item.cluster}</strong>
              <ul>
                {item.feedbacks.map(
                  (feedback: string, feedbackIndex: number) => (
                    <li key={feedbackIndex}>{feedback}</li>
                  )
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommonFeedback;
