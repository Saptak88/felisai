// Message.jsx
import React from "react";
import "./Message.css";
import Markdown from "react-markdown";
//import DOMPurify from "dompurify";

const Message = ({ text, sender, isLoading }) => {
    /*
    const formatMessage = (text) => {
        const parts = text.split(/(```[\s\S]*?```)/g); // Split text by triple backticks
        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const highlightedText = part.replace(/```/g, " "); // Remove triple backticks
                return (
                    <div key={index} className="code-message">
                        {highlightedText}
                    </div>
                );
            }
            return part;
        });
    };*/
    //const sanitizedText = DOMPurify.sanitize(text);
    const components = {
        code({ node, className, children, ...props }) {
            const isInline = !className; // If className is not present, it's inline code

            if (isInline) {
                return <code {...props}>{children}</code>;
            }

            const language = className?.replace("language-", "");
            return (
                <span className="code-message">
                    {language && language?.trim() !== "" && <div className="cm-header">{language}</div>}
                    <span className="cm-inside">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </span>
                </span>
            );
        },

        // Add more custom components as needed
    };
    //
    return (
        <div className={`message ${sender === "user" ? "user-message" : "bot-message"}`}>
            <div className={`avatar ${isLoading ? "rotate" : ""}  ${sender === "user" ? "d-none" : ""}`}>
                {!isLoading && (
                    <svg fill="#b4b4b4" width="26px" height="26px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                        <path d="M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z" />
                    </svg>
                )}
                {isLoading && (
                    <svg fill="#b4b4b4" width="16px" height="16px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                        <path d="M120,76A44,44,0,1,1,76,32,44.04978,44.04978,0,0,1,120,76Zm60,44a44,44,0,1,0-44-44A44.04978,44.04978,0,0,0,180,120ZM76,136a44,44,0,1,0,44,44A44.04978,44.04978,0,0,0,76,136Zm104,0a44,44,0,1,0,44,44A44.04978,44.04978,0,0,0,180,136Z" />
                    </svg>
                )}
            </div>
            <div className="message-p">
                {sender === "assistant" && <Markdown children={text} components={components} />}
                {sender === "user" && text}
            </div>
        </div>
    );
};

export default Message;
