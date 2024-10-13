import { NextRequest, NextResponse } from 'next/server';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';
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
    // console.log("sentimentData - ", sentimentData);
    
    // Extract the sentiment scores
    const scores = sentimentData[0];
    
    // Determine the sentiment with the highest score
    const highestSentiment = scores.reduce((prev: any, current: any) => {
      return (prev.score > current.score) ? prev : current;
    });

    const sentimentLabel = highestSentiment.label.toUpperCase(); // Convert to uppercase
    const sentimentScore = highestSentiment.score;

    return NextResponse.json({ sentiment: sentimentLabel, score: sentimentScore });
  } catch (error) {
    console.error('Error during sentiment analysis:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing sentiment.' }, { status: 500 });
  }
}
