import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.HF_TOKEN);

router.post(
    "/message",
    asyncHandler(async (req, res) => {
        const { messages } = req.body;
        // console.log(req.body);

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Invalid messages" });
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-transform");
        res.setHeader("Connection", "keep-alive");
        for await (const chunk of inference.chatCompletionStream({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: messages,
            max_tokens: 1000,
        })) {
            const data = chunk.choices[0]?.delta?.content || "";
            res.write(`${data}`);
        }
        res.end();
    })
);

export default router;
