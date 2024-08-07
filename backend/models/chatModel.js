import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            default: 0,
        },
        name: {
            type: String,
            default: "New chat",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const chatMessageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["user", "assistant"],
        },
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export { Session, ChatMessage };
