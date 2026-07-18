import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

// Coupon (spec §B5). Codes stored uppercase; validated server-side at order time.
const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "flat"], required: true },
    value: { type: Number, required: true },
    expiry: { type: Date },
    minOrderValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CouponSchemaType = InferSchemaType<typeof CouponSchema>;

export const Coupon: Model<CouponSchemaType> =
  (models.Coupon as Model<CouponSchemaType>) || model<CouponSchemaType>("Coupon", CouponSchema);
