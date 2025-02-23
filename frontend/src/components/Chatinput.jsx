import React, { useState, useRef, useEffect } from "react";
import "./Chatinput.css";

const Chatinput = ({ onSendMessage, isLoading, modelType }) => {
    const [message, setMessage] = useState("");
    const textAreaRef = useRef(null);
    //audio
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = sendAudioToBackend;
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };
    const sendAudioToBackend = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
            const response = await fetch("/api/v1/chat/transcribe", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setMessage(data.text);
        } catch (error) {
            console.error("Error sending audio:", error);
        }
    };
    //audio

    //
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0"; // Reset height temporarily
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [message]);
    //

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chatInputContainer ms-sm-5 ms-2 me-sm-5 me-2">
            <textarea
                ref={textAreaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={modelType ? "Message FelisAI" : "Message FelisAI Cancer"}
            />
            <button onClick={handleSendMessage} className={`sendbutton ${message !== "" || isLoading ? "bg-light" : "disabled"}`}>
                {!isLoading && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" className="icon-2xl">
                        <path
                            fill="#2f2f2f"
                            fillRule="evenodd"
                            d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                )}
                {isLoading && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" class="icon-lg">
                        <rect width="10" height="10" x="7" y="7" fill="#2f2f2f" rx="1.25"></rect>
                    </svg>
                )}
            </button>
            <button onClick={recording ? stopRecording : startRecording} className={`sendbutton ms-1 bg-light`}>
                {!recording && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="#2f2f2f"
                        class="bi bi-mic-fill"
                        viewBox="-4 1 24 13"
                    >
                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z" />
                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
                    </svg>
                )}
                {recording && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" class="icon-lg">
                        <rect width="10" height="10" x="7" y="7" fill="#2f2f2f" rx="1.25"></rect>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default Chatinput;
