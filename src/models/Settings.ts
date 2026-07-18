import { Schema, model, models, type Model } from "mongoose";
import type { SettingsShape } from "@/types";

/**
 * Singleton CMS settings document (spec §B4). One row; read via getSettings().
 * The `key` field is fixed to "singleton" with a unique index so upserts never
 * create a second row.
 */
export interface SettingsDoc extends SettingsShape {
  key: "singleton";
}

const NavLinkSchema = new Schema(
  { label: String, href: String },
  { _id: false },
);

const FooterColumnSchema = new Schema(
  { title: String, links: [NavLinkSchema] },
  { _id: false },
);

const SettingsSchema = new Schema<SettingsDoc>(
  {
    key: { type: String, default: "singleton", unique: true, immutable: true },
    branding: {
      siteName: { type: String, default: "Lara's Pinnal" },
      tagline: { type: String, default: "The Crochet Corner" },
      logoUrl: String,
      faviconUrl: String,
      social: [{ label: String, href: String, _id: false }],
    },
    commerce: {
      currency: { type: String, default: "INR" },
      shippingFlatRate: { type: Number, default: 49 },
      freeShippingThreshold: { type: Number, default: 999 },
      defaultLeadTime: { type: Number, default: 4 },
      codEnabled: { type: Boolean, default: true },
      whatsappNumber: String,
      businessAddress: String,
      gstNumber: String,
    },
    announcementBar: {
      text: { type: String, default: "Handmade to order across India · Free shipping over ₹999" },
      active: { type: Boolean, default: false },
    },
    footer: {
      columns: [FooterColumnSchema],
      contactInfo: { type: String, default: "" },
      copyright: { type: String, default: "© Lara's Pinnal" },
    },
    seoDefaults: {
      title: { type: String, default: "Lara's Pinnal — The Crochet Corner" },
      description: {
        type: String,
        default: "Handmade crochet, made to order in Tamil Nadu.",
      },
      ogImage: String,
    },
  },
  { timestamps: true },
);

export const Settings: Model<SettingsDoc> =
  (models.Settings as Model<SettingsDoc>) || model<SettingsDoc>("Settings", SettingsSchema);
