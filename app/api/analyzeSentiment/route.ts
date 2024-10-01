import { NextRequest, NextResponse } from 'next/server';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';
const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN; // Store your token in .env.local

// Named export for the POST method
export async function POST(request: NextRequest) {
  const { text } = await request.json();

  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const sentimentData = await response.json();

    // Extract the sentiments
    const sentiments = sentimentData[0]; // Get the first item (the array of sentiments)
    
    // Initialize variables to hold the sentiment results
    let sentimentLabel = '';
    let sentimentScore = 0;

    // Determine the sentiment based on the scores
    sentiments.forEach((sentiment: { label: string; score: number }) => {
      if (sentiment.label === 'POSITIVE' && sentiment.score > sentimentScore) {
        sentimentLabel = 'POSITIVE';
        sentimentScore = sentiment.score;
      } else if (sentiment.label === 'NEGATIVE' && sentiment.score > sentimentScore) {
        sentimentLabel = 'NEGATIVE';
        sentimentScore = sentiment.score;
      }
    });

    // Check for neutral sentiment
    if (sentimentScore >= 0.4 && sentimentScore <= 0.6) {
      sentimentLabel = 'NEUTRAL';
      sentimentScore = (sentiments.find((sentiment: { label: string; }) => sentiment.label === 'POSITIVE')?.score || 0) +
                       (sentiments.find((sentiment: { label: string; }) => sentiment.label === 'NEGATIVE')?.score || 0);
    }

    return NextResponse.json({ sentiment: sentimentLabel, score: sentimentScore });
  } catch (error) {
    console.error('Error during sentiment analysis:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing sentiment.' }, { status: 500 });
  }
}
