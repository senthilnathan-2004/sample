import type { Metadata } from "next";
import { GuestTrackClient } from "@/components/account/GuestTrackClient";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage({ searchParams }: { searchParams: { order?: string } }) {
  return <GuestTrackClient initialOrder={searchParams.order ?? ""} />;
}
