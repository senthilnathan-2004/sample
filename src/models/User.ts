import { Schema, model, models, Types, type Model } from "mongoose";

/**
 * User (spec §B5). email/phone are unique but sparse (either may be absent —
 * phone-OTP users may have no email, and vice-versa). passwordHash is optional
 * (phone-only accounts have no password). Addresses are embedded subdocuments.
 */
const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, enum: ["home", "work"], default: "home" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  addresses: Types.DocumentArray<AddressSub>;
  defaultAddressId?: Types.ObjectId;
  wishlist: Types.ObjectId[];
  recentlyViewed: { productId: Types.ObjectId; at: Date }[];
  notificationPrefs: { whatsapp: boolean; email: boolean };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressSub {
  _id: Types.ObjectId;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work";
  isDefault: boolean;
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: String,
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatar: String,
    addresses: [AddressSchema],
    defaultAddressId: { type: Schema.Types.ObjectId },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    recentlyViewed: [
      { productId: { type: Schema.Types.ObjectId, ref: "Product" }, at: Date, _id: false },
    ],
    notificationPrefs: {
      whatsapp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
