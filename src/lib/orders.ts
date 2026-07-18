import { dbConnect } from "./db";
import { Order, type OrderDoc } from "@/models/Order";
import { nextSeq } from "@/models/Counter";
import { computeOrderTotals, maxLeadTime } from "./pricing";
import type { CreateOrderInput } from "./validate";

/** Generate a human-readable order number, e.g. LP-2026-0007. */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSeq(`order-${year}`);
  return `LP-${year}-${String(seq).padStart(4, "0")}`;
}

/**
 * Create an order with SERVER-RECOMPUTED totals. Used by both the COD route and
 * the Razorpay create-order route. Client-supplied prices/discounts are ignored.
 * The order starts `placed` / `pending`; the webhook flips payment to `paid`.
 */
export async function createOrder(
  input: CreateOrderInput,
  opts: { userId?: string | null } = {},
): Promise<OrderDoc> {
  await dbConnect();

  const totals = await computeOrderTotals(input.items, input.couponCode || undefined);
  const lead = await maxLeadTime(input.items);
  const orderNumber = await generateOrderNumber();

  const estimatedReadyBy = new Date();
  estimatedReadyBy.setDate(estimatedReadyBy.getDate() + lead);

  const order = await Order.create({
    orderNumber,
    userId: opts.userId ?? null,
    customer: {
      name: input.customer.name,
      phone: input.customer.phone,
      email: input.customer.email || undefined,
    },
    shippingAddress: input.shippingAddress,
    items: totals.items,
    subtotal: totals.subtotal,
    couponCode: totals.couponCode,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    fulfillmentStatus: "placed",
    statusHistory: [{ status: "placed", at: new Date(), note: "Order placed" }],
    estimatedReadyBy,
  });

  return order;
}
