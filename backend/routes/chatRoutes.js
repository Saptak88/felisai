import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
const router = express.Router();
import { Session, ChatMessage } from "../models/chatModel.js";
import { protect } from "../middleware/authMiddleware.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.ACCESS_TOKEN });

router.post(
    "/message",
    asyncHandler(async (req, res) => {
        const { messages, sessionId } = req.body;

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Invalid messages" });
        }

        const firstMessage = {
            role: "system",
            content: "You are a Bengali AI assistant and you will answer in Bengali unless you are told otherwise",
        };
        messages.unshift(firstMessage);

        const lastMessage = messages[messages.length - 1];
        if (sessionId) {
            const chatMessage = new ChatMessage({
                sessionId,
                content: lastMessage.content,
                role: lastMessage.role,
            });

            await chatMessage.save();
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-transform");
        res.setHeader("Connection", "keep-alive");

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-70b-8192",
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null,
        });
        let accumulatedContent = "";
        for await (const chunk of chatCompletion) {
            const data = chunk.choices[0]?.delta?.content || "";
            accumulatedContent += data;
            res.write(`${data}`);
        }
        res.end();
        if (sessionId) {
            const chatMessage = new ChatMessage({
                sessionId,
                content: accumulatedContent,
                role: "assistant",
            });

            await chatMessage.save();
        }
    })
);

router.post(
    "/new",
    protect,
    asyncHandler(async (req, res) => {
        const session = new Session({
            userId: req.user._id || "default_user", // Use a default value or handle userId based on your requirements
        });
        await session.save();
        res.status(201).json({ sessionId: session._id.toString() });
    })
);

router.post(
    "/history",
    protect,
    asyncHandler(async (req, res) => {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }
        try {
            // Fetch chat history from the database
            const messages = await ChatMessage.find({ sessionId }).select("role content -_id").sort({ createdAt: 1 });

            // Return the messages
            res.json(messages);
        } catch (error) {
            console.error("Error fetching chat history:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
);

router.get(
    "/sessions",
    protect, // Apply authentication middleware
    asyncHandler(async (req, res) => {
        try {
            const userId = req.user._id; // Assuming user ID is available in req.user from auth middleware
            const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
            res.json(sessions);
        } catch (error) {
            console.error("Error fetching sessions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
);

export default router;
