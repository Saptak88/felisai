import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { dirname } from "path";
//import path from "path";
import { fileURLToPath } from "url";
//const __dirname = dirname(fileURLToPath(import.meta.url));
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const port = process.env.PORT || 5000;

//connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chat", chatRoutes);

//app.use(express.static(path.join(__dirname, "../frontend/build")));

//app.get("*", (req, res) => {
// res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
//});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
