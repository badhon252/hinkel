import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    codeName: { type: String, required: true, trim: true, uppercase: true },
    expiryDate: { type: Date, required: true },
    usesLimit: { type: Number, required: true },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'flat']
    },
    discountAmount: { type: Number, required: true },
    usedCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// ✅ Indexes — speeds up the exact fields we filter and sort on
couponSchema.index({ codeName: 1 }, { unique: true });
couponSchema.index({ discountType: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ discountType: 1, expiryDate: 1 }); // compound for combined filters

export const Coupon = mongoose.model('Coupon', couponSchema);
