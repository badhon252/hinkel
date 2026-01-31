import mongoose from "mongoose";

const StyleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        badgeText: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

const Styles = mongoose.model("Styles", StyleSchema);

export const styleModel = Styles;
