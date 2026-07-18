import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

// CMS policy/info pages (spec §B4). bodyHtml is sanitized before save.
const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    bodyHtml: { type: String, default: "" },
    seo: { title: String, description: String },
  },
  { timestamps: true },
);

export type PageSchemaType = InferSchemaType<typeof PageSchema>;

export const Page: Model<PageSchemaType> =
  (models.Page as Model<PageSchemaType>) || model<PageSchemaType>("Page", PageSchema);
