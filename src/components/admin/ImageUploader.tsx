"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/**
 * Multi-image manager. Uploads via signed ImageKit auth when configured; always
 * supports pasting an image URL (so products can be created without ImageKit keys).
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const addUrl = () => {
    if (!url.trim()) return;
    onChange([...value, url.trim()]);
    setUrl("");
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  async function uploadFile(file: File) {
    setBusy(true);
    setNote("");
    try {
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) {
        setNote("ImageKit not configured — paste an image URL instead.");
        setBusy(false);
        return;
      }
      const auth = await authRes.json();
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("publicKey", auth.publicKey);
      form.append("signature", auth.signature);
      form.append("expire", String(auth.expire));
      form.append("token", auth.token);
      const up = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: form,
      });
      const data = await up.json();
      if (data.url) onChange([...value, data.url]);
      else setNote("Upload failed.");
    } catch {
      setNote("Upload failed — paste an image URL instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-hairline">
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove image"
              className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-black/60 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-control border border-hairline px-3 py-2 text-sm hover:bg-brand-tint">
          {busy ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
        </label>
        <span className="text-xs text-muted">or</span>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste image URL" className="max-w-xs" />
        <Button variant="secondary" size="sm" onClick={addUrl}>
          Add URL
        </Button>
      </div>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
