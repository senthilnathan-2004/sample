import type { OrderDoc } from "@/models/Order";

/**
 * Notifications hub — called ONLY from server code (API routes / webhook), never
 * the client. Channels degrade gracefully:
 *   - WhatsApp Cloud API when WHATSAPP_API_TOKEN is set
 *   - Email (Resend) when RESEND_API_KEY is set
 *   - Otherwise logs to the server console (dev)
 * Never throws — a failed notification must not break an order/payment flow.
 */

async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Lara's Pinnal <orders@laraspinnal.in>",
        to,
        subject,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Try WhatsApp → email → console, in order. */
async function deliver(opts: { phone?: string; email?: string; subject: string; message: string }) {
  const { phone, email, subject, message } = opts;
  let sent = false;
  if (phone) sent = await sendWhatsApp(phone, message);
  if (!sent && email) sent = await sendEmail(email, subject, message);
  if (!sent) console.log(`[NOTIFY] ${subject} → ${phone ?? email ?? "?"}\n${message}`);
}

const money = (n: number) => `₹${n}`;

export const notify = {
  async orderConfirmed(order: OrderDoc) {
    await deliver({
      phone: order.customer.phone,
      email: order.customer.email,
      subject: `Order ${order.orderNumber} confirmed`,
      message: `Hi ${order.customer.name}, thanks for your order ${order.orderNumber} (${money(
        order.total,
      )}). We'll hand-make it and keep you posted. — Lara's Pinnal`,
    });
  },

  async orderShipped(order: OrderDoc) {
    await deliver({
      phone: order.customer.phone,
      email: order.customer.email,
      subject: `Order ${order.orderNumber} shipped`,
      message: `Your order ${order.orderNumber} has shipped via ${order.courierName}. Tracking: ${order.trackingNumber}. — Lara's Pinnal`,
    });
  },

  async orderDelivered(order: OrderDoc) {
    await deliver({
      phone: order.customer.phone,
      email: order.customer.email,
      subject: `Order ${order.orderNumber} delivered`,
      message: `Your order ${order.orderNumber} has been delivered. We'd love a review! — Lara's Pinnal`,
    });
  },

  async customOrderReceived(input: { name: string; phone: string }) {
    const adminPhone = process.env.WHATSAPP_PHONE_NUMBER_ID ? process.env.NEXT_PUBLIC_SITE_URL : undefined;
    await deliver({
      phone: adminPhone ? undefined : undefined,
      subject: "New custom order request",
      message: `New custom crochet request from ${input.name} (${input.phone}). Check the admin queue.`,
    });
  },

  async sendOtpMessage(identifier: string, code: string) {
    // SMS provider wiring is env-driven; here we route through the same graceful
    // fallback (dev → console). The OTP lib calls this when SMS_PROVIDER is set.
    await deliver({
      phone: /^\d{10}$/.test(identifier) ? identifier : undefined,
      email: identifier.includes("@") ? identifier : undefined,
      subject: "Your Lara's Pinnal code",
      message: `Your verification code is ${code}. It expires in 5 minutes.`,
    });
  },
};
