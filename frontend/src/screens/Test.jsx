import React, { useState, useEffect } from "react";
import "./Test.css";

function Test() {
    const [prompt, updatePrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        if (prompt != null && prompt.trim() === "") {
            setAnswer("");
        }
    }, [prompt]);

    const sendPrompt = async (event) => {
        if (event.key !== "Enter") {
            return;
        }

        try {
            setLoading(true);
            setAnswer("");
            const response = await fetch("/stream2", {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*", // indicates which files we are able to understand
                    "Content-Type": "application/json", // indicates what the server actually sent
                },
                body: JSON.stringify({ userPrompt: prompt }), // server is expecting JSON
            });
            if (!response.ok || !response.body) {
                throw response.statusText;
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const loopRunner = true;

            while (loopRunner) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                const decodedChunk = decoder.decode(value, { stream: true });
                setAnswer((answer) => answer + decodedChunk);
            }
        } catch (err) {
            console.error(err, "err");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <div className="app-container">
                <div className="spotlight__wrapper">
                    <input
                        type="text"
                        className="spotlight__input"
                        placeholder="Ask me anything..."
                        disabled={loading}
                        onChange={(e) => updatePrompt(e.target.value)}
                        onKeyDown={(e) => sendPrompt(e)}
                    />
                    <div className="spotlight__answer">{answer && <p>{answer}</p>}</div>
                </div>
            </div>
        </div>
    );
}

export default Test;
