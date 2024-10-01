"use client";
import { useState } from 'react';

const FeedbackForm: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/analyzeSentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: feedback }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }


      const data = await response.json();
      // Assuming the response contains 'sentiment' and 'score'
      console.log(data)
      setSentiment(data.sentiment); // 'positive', 'negative', or 'neutral'
      setScore(data.score); // score, e.g., between -1 and 1
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback"
        required
      />
      <button type="submit">Analyze Sentiment</button>
      {sentiment && <p>Sentiment: {sentiment} (Score: {score?.toFixed(4)})</p>}
    </form>
  );
};

export default FeedbackForm;
