// Message.jsx
import React from "react";
import "./Message.css"; // Import your CSS file for styling

const Message = ({ text, sender }) => {
    return (
        <div className={`message ${sender === "user" ? "user-message" : "bot-message"}`}>
            <p>{text}</p>
        </div>
    );
};

export default Message;
