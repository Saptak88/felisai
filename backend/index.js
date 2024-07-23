import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import asyncHandler from "./middleware/asyncHandler.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.post("/stream", async function (req, res) {
    res.write("Wake up, Neo...\n");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.write("The Matrix has you...\n");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.write("...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.end();
});
app.post(
    "/stream2",
    asyncHandler(async (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-transform");
        res.setHeader("Connection", "keep-alive");

        // Simulate streaming data with delays
        const simulateStream = async () => {
            const simulatedChunks = [
                "This is a simulated",
                "stream of data",
                "with delays",
                "to mimic real-time streaming",
                "for testing purposes.",
            ];

            for (const chunk of simulatedChunks) {
                res.write(`data: ${chunk}\n\n`);
                console.log(chunk);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay of 1 second between chunks
            }
            res.end();
            console.log("end");
        };

        simulateStream();
    })
);
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3003, function () {
    console.log("server running on 3003");
});
