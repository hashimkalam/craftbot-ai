"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";

function AudioTranscriber() {
  const { user } = useUser();
  
  // State variables for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        audioChunksRef.current = [];
        setIsRecording(false);

        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // Transcribing audio
  const transcribeAudio = async (audioBlob: Blob) => {
    // console.log("Transcribing...");
    setTranscribing(true);

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const response = await fetch("/api/voice-over", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio (clientside)");
      }

      const data = await response.json();
      // console.log("Transcription received from server (clientSide): ", data.transcription);
      setTranscription(data.transcription);
    } catch (error) {
      console.error("Error in transcribing audio recording: ", error);
    } finally {
      setTranscribing(false);
    }
  };

  // Render loading state if the user is not authenticated
  if (!user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center relative">
      <div className="space-y-8 pb-24 flex flex-col item-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="mb-12 bg-green-400 hover:bg-green-600 px-6 py-2 flex mx-auto"
          >
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="mb-12 bg-red-400 hover:bg-red-600 px-6 py-2 flex mx-auto"
          >
            Stop Recording
          </Button>
        )}

        {isRecording && <div>Recording... You can stop anytime.</div>}

        {transcribing && <div>Transcribing...</div>}

        {transcription && (
          <div className="w-[50%] mx-auto text-justify shadow-lg p-8 bg-blue-100">
            <h3>Transcription:</h3>
            <p>{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioTranscriber;
