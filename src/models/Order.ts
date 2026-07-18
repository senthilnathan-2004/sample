import { Schema, model, models, Types, type Model } from "mongoose";

// Order (spec §B5). Payment/fulfillment are server-controlled; the client never
// sets paymentStatus — only the signature-verified webhook (Phase 3.5) does.
const AddressSubSchema = new Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    type: { type: String, enum: ["home", "work"], default: "home" },
  },
  { _id: false },
);

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    variant: { type: Schema.Types.Mixed },
    quantity: Number,
    price: Number, // unit price at order time (server-computed)
    customText: String,
  },
  { _id: false },
);

const StatusHistorySchema = new Schema(
  {
    status: String,
    at: { type: Date, default: () => new Date() },
    note: String,
  },
  { _id: false },
);

export interface OrderDoc {
  _id: Types.ObjectId;
  orderNumber: string;
  userId?: Types.ObjectId | null;
  customer: { name: string; phone: string; email?: string };
  shippingAddress: Record<string, unknown>;
  items: {
    productId: Types.ObjectId;
    name: string;
    variant: unknown;
    quantity: number;
    price: number;
    customText?: string;
  }[];
  subtotal: number;
  couponCode?: string;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  fulfillmentStatus: "placed" | "in_progress" | "ready" | "shipped" | "delivered" | "cancelled";
  statusHistory: { status: string; at: Date; note?: string }[];
  trackingNumber?: string;
  courierName?: string;
  estimatedReadyBy?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true, index: true },
      email: String,
    },
    shippingAddress: AddressSubSchema,
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    couponCode: String,
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    fulfillmentStatus: {
      type: String,
      enum: ["placed", "in_progress", "ready", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    trackingNumber: String,
    courierName: String,
    estimatedReadyBy: Date,
  },
  { timestamps: true },
);

export const Order: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) || model<OrderDoc>("Order", OrderSchema);
