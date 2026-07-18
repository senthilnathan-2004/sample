"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SettingsShape } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContentEditor({ initial }: { initial: SettingsShape }) {
  const router = useRouter();
  const [f, setF] = useState({
    siteName: initial.branding.siteName,
    tagline: initial.branding.tagline,
    logoUrl: initial.branding.logoUrl ?? "",
    annText: initial.announcementBar.text,
    annActive: initial.announcementBar.active,
    shippingFlatRate: initial.commerce.shippingFlatRate,
    freeShippingThreshold: initial.commerce.freeShippingThreshold,
    codEnabled: initial.commerce.codEnabled,
    whatsappNumber: initial.commerce.whatsappNumber ?? "",
    contactInfo: initial.footer.contactInfo,
    copyright: initial.footer.copyright,
  });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branding: { siteName: f.siteName, tagline: f.tagline, logoUrl: f.logoUrl },
        announcementBar: { text: f.annText, active: f.annActive },
        commerce: {
          shippingFlatRate: Number(f.shippingFlatRate),
          freeShippingThreshold: Number(f.freeShippingThreshold),
          codEnabled: f.codEnabled,
          whatsappNumber: f.whatsappNumber,
        },
        footer: { contactInfo: f.contactInfo, copyright: f.copyright },
      }),
    });
    setBusy(false);
    setStatus(res.ok ? "Saved — storefront updated ✓" : "Could not save.");
    if (res.ok) router.refresh();
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-card border border-hairline bg-white p-4 shadow-card">
      <h2 className="mb-3 font-heading font-bold">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );

  return (
    <div className="grid max-w-2xl gap-5">
      <Section title="Branding">
        <label className="text-sm">Site name<Input value={f.siteName} onChange={(e) => set("siteName", e.target.value)} /></label>
        <label className="text-sm">Tagline<Input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
        <label className="text-sm">Logo URL<Input value={f.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="optional" /></label>
      </Section>

      <Section title="Announcement bar">
        <label className="text-sm">Text<Input value={f.annText} onChange={(e) => set("annText", e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.annActive} onChange={(e) => set("annActive", e.target.checked)} className="accent-brand" />
          Show announcement bar
        </label>
      </Section>

      <Section title="Commerce">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Flat shipping ₹<Input type="number" value={f.shippingFlatRate} onChange={(e) => set("shippingFlatRate", e.target.value)} /></label>
          <label className="text-sm">Free shipping over ₹<Input type="number" value={f.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", e.target.value)} /></label>
        </div>
        <label className="text-sm">WhatsApp number<Input value={f.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.codEnabled} onChange={(e) => set("codEnabled", e.target.checked)} className="accent-brand" />
          Enable Cash on Delivery
        </label>
      </Section>

      <Section title="Footer">
        <label className="text-sm">Contact info<Input value={f.contactInfo} onChange={(e) => set("contactInfo", e.target.value)} /></label>
        <label className="text-sm">Copyright<Input value={f.copyright} onChange={(e) => set("copyright", e.target.value)} /></label>
      </Section>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        {status && <span className="text-sm text-success" aria-live="polite">{status}</span>}
      </div>
    </div>
  );
}
