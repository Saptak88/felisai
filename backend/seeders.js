import mongoose from "mongoose";
import dotenv from "dotenv";
import items from "./listitems.js";
import users from "./users.js";
import User from "./models/userModel.js";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import connectDB from "./config/db.js";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB();

const seedDB = async () => {
    try {
        await User.deleteMany(); // Clear existing users
        await User.insertMany(users);
        console.log("Data seeded successfully");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
