import type { Metadata } from "next";
import { LoginClient } from "@/components/account/LoginClient";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; mode?: string };
}) {
  const next = searchParams.next ?? "/account";
  const mode = searchParams.mode === "register" ? "register" : "signin";
  return <LoginClient next={next} initialMode={mode} />;
}
