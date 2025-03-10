'use client';
import { resolve } from "path";
import React, { useState, useEffect, useRef } from "react";


export const useRecordVoice = () => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<any>(null);
    const chunks = useRef<Blob[]>([]);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);


    const startrecording = () => {
        if (mediaRecorder) {
            chunks.current = [];
            setAudioBlob(null);
            mediaRecorder.start(200);
            setRecording(true);
            console.log("Recording started");
        }
    };

    const stoprecording = () => {
        return new Promise<Blob | null>((resolve) => {
            if (mediaRecorder && recording) {

                const handleStop = () => {
                    const blob = new Blob(chunks.current, { type: 'audio/wav' });
                    setAudioBlob(blob);
                    resolve(blob);
                    mediaRecorder.removeEventListener('stop', handleStop);
                };
                mediaRecorder.addEventListener('stop', handleStop);
                mediaRecorder.stop();
                setRecording(false);
                console.log("Recording stopped");

            } else {
                resolve(null);
            }

        });
    };

    const initialMediaRecorder = (stream: MediaStream) => {
        chunks.current = [];
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
            chunks.current = [];

        };
        mediaRecorder.ondataavailable = (ev) => {
            chunks.current.push(ev.data);

        };
        console.log(chunks.current)
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks.current, { type: 'audio/wav' });
            setAudioBlob(blob);


        };
        setMediaRecorder(mediaRecorder);
        console.log("Media recorder initialized");
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(initialMediaRecorder)
                .catch(err => {
                    console.error("Error accessing microphone:", err);
                    alert("Microphone access is required for recording. Please enable it in your device settings.");

                });
        }

        return () => {
            if (mediaRecorder) {
                if (recording) {
                    mediaRecorder.stop();
                }
            }
        };
    }, []);

    return { startrecording, stoprecording, recording, audioBlob };
};