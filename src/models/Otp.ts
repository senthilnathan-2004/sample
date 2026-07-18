import { Schema, model, models, type Model } from "mongoose";

/**
 * OTP codes stored HASHED with a TTL index (auto-expire). Never store the raw
 * code. `attempts` caps brute-force; the doc is removed on success.
 */
export interface OtpDoc {
  identifier: string; // phone or email
  codeHash: string;
  purpose: "login" | "verify" | "reset";
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<OtpDoc>({
  identifier: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  purpose: { type: String, enum: ["login", "verify", "reset"], required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

// TTL index — MongoDB removes the doc once expiresAt passes.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<OtpDoc> =
  (models.Otp as Model<OtpDoc>) || model<OtpDoc>("Otp", OtpSchema);
