import { getSettings } from "@/lib/settings";
import { razorpayConfigured } from "@/lib/razorpay";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <CheckoutClient
      razorpayEnabled={razorpayConfigured()}
      codEnabled={settings.commerce.codEnabled}
    />
  );
}
