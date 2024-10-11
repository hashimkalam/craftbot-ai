import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const API_KEY = process.env.ASSEMBLY_AI;

// Handle POST requests
export async function POST(req: NextRequest) {
  // console.log("Entered server side");
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided or invalid file' }, { status: 400 });
    }

    // Upload the file to AssemblyAI
    const audioBlob = new Blob([file], { type: file.type });
    const audioUrl = await uploadAudio(audioBlob);

    // Request transcription
    const transcription = await requestTranscription(audioUrl);

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error transcribing audio: ", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error }, { status: 500 });
  }
}

// Function to upload audio to AssemblyAI
const uploadAudio = async (audioBlob: Blob): Promise<string> => {
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    body: audioBlob,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text(); // Get error response text for logging
    console.error("Upload error:", errorText);
    throw new Error('Failed to upload audio');
  }

  const uploadData = await uploadResponse.json();
  return uploadData.upload_url;
};

// Function to request transcription from AssemblyAI
const requestTranscription = async (audioUrl: string): Promise<string> => {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audio_url: audioUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Get error response text for logging
    console.error("Transcription request error:", errorText);
    throw new Error('Failed to request transcription');
  }

  const transcriptionData = await response.json();
  const transcriptId = transcriptionData.id;

  // Poll for the transcription result
  while (true) {
    const resultResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!resultResponse.ok) {
      const errorText = await resultResponse.text(); // Get error response text for logging
      console.error("Transcription result error:", errorText);
      throw new Error('Failed to get transcription result');
    }

    const transcriptResult = await resultResponse.json();

    if (transcriptResult.status === 'completed') {
      return transcriptResult.text || '';
    } else if (transcriptResult.status === 'failed') {
      throw new Error('Transcription failed');
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust the interval as needed
  }
}
