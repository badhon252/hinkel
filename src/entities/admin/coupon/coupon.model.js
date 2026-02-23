import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        codeName: { type: String, required: true, trim: true, uppercase: true },
        expiryDate: { type: Date, required: true },
        usesLimit: { type: Number, required: true },
        discountType: { type: String, required: true, enum: ["percentage", "flat"] },
        discountAmount: { type: Number, required: true },
    },
    { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);