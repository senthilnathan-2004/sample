import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

// Home hero banners (spec §B4).
const BannerSchema = new Schema(
  {
    image: { type: String, required: true },
    headline: String,
    subtext: String,
    ctaText: String,
    ctaLink: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startAt: Date,
    endAt: Date,
  },
  { timestamps: true },
);

export type BannerSchemaType = InferSchemaType<typeof BannerSchema>;

export const Banner: Model<BannerSchemaType> =
  (models.Banner as Model<BannerSchemaType>) || model<BannerSchemaType>("Banner", BannerSchema);
