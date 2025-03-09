'use client'
import React, { useDebugValue } from "react";
import { useEffect, useState, useRef } from "react";

import { useRecordVoice } from "./components/page";


export default function Home() {
  const { startrecording, stoprecording, recording, audioBlob } = useRecordVoice();
  const [transciption, setTransciption] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  const handleStartRecording = () => {
    startrecording();
  }

  const handleStopRecording = async () => {
    setIsLoading(true);

    try {
      const blob = await stoprecording();
      console.log("audioblob from stoprecording",blob);

      if (blob) {
        const formData = new FormData();
        formData.append('audio', blob);
        
        const response = await fetch('http://localhost:5000/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setTransciption(data.transcription);
        } else {
          console.error('Failed to transcribe');
        }
      }

    } catch (error) {
      console.error("error sending audio", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsLoading(true);
      const files = Array.from(e.target.files);
      for (const file of files) {
        const formData = new FormData();
        formData.append('audio', file);
        try {
          const response = await fetch('http://localhost:5000/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setTransciption((prev: string) => prev + "\n" + data.transcription);
          } else {
            console.error('Failed to transcribe');
          }
        } catch (error) {
          console.error("error sending audio", error);
        }
      }
      setIsLoading(false);

    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">

      <div className="">
        <h2 className="text-2xl font-bold text-center mb-6">Record your voice or Upload a file to get your transciption</h2>
        <div className="flex flex-row items-center justify-center p-4 border-2  border-gray-50-300  rounded-lg hover:bg-gray-50 transition-colors">
          <div className="mr-auto">
            {recording ? "Recording..." : " Record or Upload"}
          </div>

          {recording ? (
            <>
              { }
              <div className=" flex items-center mr-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-red-500 font-medium">REC</span>
              </div>
              { }
              <button
                onClick={handleStopRecording}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                STOP
              </button>
            </>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleStartRecording}
              className="h-8 w-8 border-2 mr-2 p-1 text-red-500 cursor-pointer hover:bg-red-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}

          {/* File upload */}
          <label className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 p-1 text-blue-500 border-2 hover:bg-blue-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Transcription</h2>
        <div className={`w-full p-4 min-h-[200px] border-2 rounded-lg bg-white ${isLoading ? 'animate-pulse' : ''}`}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Processing audio...</div>
            </div>
          ) : (
            transciption ? transciption : "Your transcription will appear here"
          )}
        </div>
      </div>
    </div>
  );
}