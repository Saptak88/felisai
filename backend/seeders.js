import mongoose from "mongoose";
import dotenv from "dotenv";
import { Session } from "./models/chatModel.js";

import connectDB from "./config/db.js";
dotenv.config();

connectDB();

async function addTypeField() {
    try {
        // Update all documents to add type: 0 if the type field does not exist
        await Session.updateMany(
            { name: { $exists: false } }, // Match documents where type field does not exist
            { $set: { name: "New chat" } } // Set the type field to 0
        );
        console.log("Type field added to all documents");
    } catch (error) {
        console.error("Error updating documents:", error);
    } finally {
        mongoose.connection.close();
    }
}

addTypeField();
