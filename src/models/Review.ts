import { Schema, model, models, Types, type Model } from "mongoose";

// Review (spec §B5). New reviews default to unapproved; visible only after admin
// approval. verifiedPurchase is set when the reviewer has a delivered order with
// the product.
export interface ReviewDoc {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  name: string;
  rating: number;
  text: string;
  photos: string[];
  isApproved: boolean;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "" },
    photos: { type: [String], default: [] },
    isApproved: { type: Boolean, default: false, index: true },
    verifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) || model<ReviewDoc>("Review", ReviewSchema);
