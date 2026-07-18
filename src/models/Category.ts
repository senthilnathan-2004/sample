import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

// Category (spec §B5). Data-driven, not an enum — managed via admin CMS in Phase 5.
const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: String,
    icon: String,
    description: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { timestamps: true },
);

export type CategorySchemaType = InferSchemaType<typeof CategorySchema>;

export const Category: Model<CategorySchemaType> =
  (models.Category as Model<CategorySchemaType>) ||
  model<CategorySchemaType>("Category", CategorySchema);
