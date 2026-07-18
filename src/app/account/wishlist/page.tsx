import { redirect } from "next/navigation";

// Wishlist lives at /wishlist (client store); the account hub links here too.
export default function AccountWishlistPage() {
  redirect("/wishlist");
}
