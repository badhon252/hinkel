import { Schema, model } from 'mongoose';

export const guestSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

export const Guest = new model('Guest', guestSchema);
