"use client";

import { Input } from "@/components/ui/Input";

export type AddressValue = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work";
};

export const emptyAddress: AddressValue = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  type: "home",
};

// Guest / new address form with inline validation. Saved-address picker (logged-in)
// is added in Phase 4; this component is reused there for "add new address".
export function AddressForm({
  value,
  errors,
  onChange,
}: {
  value: AddressValue;
  errors: Partial<Record<keyof AddressValue, string>>;
  onChange: (patch: Partial<AddressValue>) => void;
}) {
  const field = (name: keyof AddressValue) => ({
    value: value[name],
    invalid: !!errors[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [name]: e.target.value }),
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Full name</label>
        <Input {...field("fullName")} placeholder="Name" autoComplete="name" />
        {errors.fullName && <p className="mt-1 text-xs text-warning">{errors.fullName}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Phone (10 digits)</label>
        <Input
          {...field("phone")}
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          autoComplete="tel"
        />
        {errors.phone && <p className="mt-1 text-xs text-warning">{errors.phone}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Pincode (6 digits)</label>
        <Input
          {...field("pincode")}
          inputMode="numeric"
          maxLength={6}
          placeholder="600001"
          autoComplete="postal-code"
        />
        {errors.pincode && <p className="mt-1 text-xs text-warning">{errors.pincode}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Flat / building / street</label>
        <Input {...field("line1")} placeholder="Address line 1" autoComplete="address-line1" />
        {errors.line1 && <p className="mt-1 text-xs text-warning">{errors.line1}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Area / locality (optional)</label>
        <Input {...field("line2")} placeholder="Address line 2" autoComplete="address-line2" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Landmark (optional)</label>
        <Input {...field("landmark")} placeholder="Near…" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">City</label>
        <Input {...field("city")} placeholder="City" autoComplete="address-level2" />
        {errors.city && <p className="mt-1 text-xs text-warning">{errors.city}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">State</label>
        <Input {...field("state")} placeholder="State" autoComplete="address-level1" />
        {errors.state && <p className="mt-1 text-xs text-warning">{errors.state}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Address type</label>
        <div className="flex gap-2">
          {(["home", "work"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ type: t })}
              className={`h-11 flex-1 rounded-control border text-sm font-medium capitalize ${
                value.type === t
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-hairline bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
