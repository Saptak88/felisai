import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
});

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        shares: {
            type: [shareSchema],
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdByEmail: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
