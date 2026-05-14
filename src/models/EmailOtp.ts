import mongoose, { Schema } from "mongoose";

const emailOtpSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const EmailOtp = mongoose.models.EmailOtp || mongoose.model("EmailOtp", emailOtpSchema);
