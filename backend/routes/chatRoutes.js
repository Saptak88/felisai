import express, { query } from "express";
import asyncHandler from "../middleware/asyncHandler.js";
const router = express.Router();
import { Session, ChatMessage } from "../models/chatModel.js";
import { protect } from "../middleware/authMiddleware.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

dotenv.config();

const upload = multer({ dest: "uploads/" });
//
//
const groq = new Groq({ apiKey: process.env.ACCESS_TOKEN });
//trnscribe
router.post(
    "/transcribe",
    upload.single("audio"),
    asyncHandler(async (req, res) => {
        const audioFilePath = req.file.path;
        const newFilePath = `${audioFilePath}.webm`;
        fs.renameSync(audioFilePath, newFilePath);
        // console.log(newFilePath);
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(newFilePath),
            model: "whisper-large-v3",
            language: "en",
            // prompt: "if nothing is said give empty response",
            response_format: "verbose_json",
        });

        fs.unlinkSync(newFilePath); // Delete temp file
        // console.log(transcription.text);
        res.json({ text: transcription.text });
    })
);
//
router.post(
    "/updateSession",
    asyncHandler(async (req, res) => {
        const { messages, sessionId } = req.body;
        const firstMessage = {
            role: "user",
            content: `You will just summarize the chat session in a few words strictly reply only the summary without any quotes.`,
        };
        messages.push(firstMessage);
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null,
        });
        const summary = chatCompletion.choices[0].message.content;
        const session = await Session.findByIdAndUpdate(
            sessionId,
            { name: summary },
            { new: true } // Return the updated session
        );
        //console.log(summary);
        res.json(session);
    })
);
//
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
            content: `You are a helpful AI assistant named FelisAI and you will answer in user's language.
                If you are asked to give program code please provide codes in the following format:
                \`\`\`language name
                code
                \`\`\`
                P.S: triple backticks and language name should be in same line and together.
                Provide other responses as normal.
                `,
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
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
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
//cancer
router.post(
    "/cancer",
    asyncHandler(async (req, res) => {
        const { messages, sessionId } = req.body;

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Invalid messages" });
        }
        //
        const query = messages[messages.length - 1].content;
        const response = await fetch("https://rag-2.vercel.app/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }), // Send the query in the body
        });
        const responseData = await response.json();
        const context = responseData.context;
        //

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

        /*      const newMessage = `INSTRUCTIONS:
You are FelisAI Cancer, a knowledgeable assistant specializing in cancer-related questions. Please respond in the language of the user's query, providing clear and friendly answers. Use relevant instances from the Document text if necessary to support your response.

DOCUMENT:
${context}

QUESTION:
${query}
`;*/
        const firstMessage = {
            role: "system",
            content: `You are FelisAI Cancer, a knowledgeable assistant specializing in cancer-related questions. Please respond in the language of the user's query, providing clear and friendly answers. Use relevant instances from the Document text if necessary to support your response.

DOCUMENT:
${context}`,
        };
        messages.unshift(firstMessage);
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
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
        //console.log(accumulatedContent);
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
//cancer end
//pdfstart
router.post(
    "/pdfchat",
    asyncHandler(async (req, res) => {
        const { messages, sessionId } = req.body;

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Invalid messages" });
        }
        //
        const query = messages[messages.length - 1].content;
        const response = await fetch("https://rag-2.vercel.app/search_session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, session_id: sessionId }), // Send the query in the body
        });
        const responseData = await response.json();
        const context = responseData.context;
        //

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

        /*      const newMessage = `INSTRUCTIONS:
You are FelisAI Cancer, a knowledgeable assistant specializing in cancer-related questions. Please respond in the language of the user's query, providing clear and friendly answers. Use relevant instances from the Document text if necessary to support your response.

DOCUMENT:
${context}

QUESTION:
${query}
`;*/
        const firstMessage = {
            role: "system",
            content: `You are FelisAI PDF, a knowledgeable assistant based on Retrieval-Augmented Generation (RAG). Please respond in the language of the user's query, providing clear and friendly answers. Use relevant instances from the Document text to support your response.

DOCUMENT:
${context}`,
        };
        messages.unshift(firstMessage);
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
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
        //console.log(accumulatedContent);
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
//pdfend
router.post(
    "/new",
    protect,
    asyncHandler(async (req, res) => {
        const { type, sessionName } = req.body;
        if (![0, 1, 2].includes(type)) {
            return res.status(400).json({ message: "Invalid session type" });
        }
        const session = new Session({
            userId: req.user._id || "default_user",
            type, // Use a default value or handle userId based on your requirements
            name: sessionName || "New chat",
        });
        await session.save();
        res.status(201).json(session);
    })
);

router.post("/upload", protect, upload.single("pdf"), async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
    }
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const form = new FormData();
        //console.log(sessionId);
        form.append("session_id", sessionId);
        form.append("file", fs.createReadStream(req.file.path));

        const response = await axios.post("https://rag-2.vercel.app/upload", form, { headers: form.getHeaders });

        if (!response.ok) {
            return res.status(response.status).json({ error: "FastAPI erro" });
        }

        res.status(200).json({
            message: "File uploaded and forwarded to FastAPI",
            fastapi_response: result,
        });
    } catch (err) {
        console.error("Error forwarding to FastAPI:", err);
        res.status(500).json({ error: "Failed to forward to FastAPI" });
    } finally {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });
    }
});

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

router.post(
    "/sessions",
    protect, // Apply authentication middleware
    asyncHandler(async (req, res) => {
        try {
            const userId = req.user._id;
            const { type } = req.body;
            if (![0, 1, 2].includes(type)) {
                return res.status(400).json({ message: "Invalid session type" });
            }
            const sessions = await Session.find({ userId, type }).sort({ createdAt: -1 });
            res.json(sessions);
        } catch (error) {
            console.error("Error fetching sessions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
);

export default router;
