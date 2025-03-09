'use client';
import React, { useState, useEffect, useRef } from "react";


export const useRecordVoice = () => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<any>(null);
    const chunks = useRef<Blob[]>([]);


    const startrecording = () => {
        if (mediaRecorder) {
            mediaRecorder.start();
            setRecording(true);
        }
    };

    const stoprecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }

    }

    const initialMediaRecorder = (stream: any) => {
        chunks.current = [];
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
            chunks.current = [];

        };
        mediaRecorder.ondataavailable = (ev) => {
            chunks.current.push(ev.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks.current, { type: 'audio/wav' });

            //send to backend

        };
        setMediaRecorder(mediaRecorder);
    };


    useEffect(() => {
        if (typeof window !== "undefined") {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(initialMediaRecorder);
        }
    }, []);

    return { startrecording, stoprecording, recording };
}