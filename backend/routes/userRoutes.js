import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        res.json(req.user);
    })
);
//login
router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (user && user.password === password) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.json({ _id: user._id, email: user.email });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    })
);
// Register route
router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Check if the user already exists
        const userExists = await User.findOne({ email: email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const user = await User.create({ email, password });

        if (user) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.json({ _id: user._id, email: user.email });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    })
);
//logout
router.post(
    "/logout",
    protect, // Ensure the user is authenticated
    asyncHandler(async (req, res) => {
        res.cookie("jwt", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            expires: new Date(0), // Expire the cookie immediately
        });
        res.status(200).json({ message: "Logged out successfully" });
    })
);

export default router;
