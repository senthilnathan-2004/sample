export type AdminRole = "owner" | "manager" | "staff";

// Role hierarchy: owner ⊇ manager ⊇ staff.
const RANK: Record<AdminRole, number> = { staff: 1, manager: 2, owner: 3 };

export function roleAtLeast(role: AdminRole | undefined, min: AdminRole): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[min];
}

// What each role can access (used for server checks and sidebar visibility).
export const CAN = {
  products: (r?: AdminRole) => roleAtLeast(r, "manager"),
  categories: (r?: AdminRole) => roleAtLeast(r, "manager"),
  orders: (r?: AdminRole) => roleAtLeast(r, "staff"),
  customers: (r?: AdminRole) => roleAtLeast(r, "manager"),
  customOrders: (r?: AdminRole) => roleAtLeast(r, "staff"),
  reviews: (r?: AdminRole) => roleAtLeast(r, "manager"),
  coupons: (r?: AdminRole) => roleAtLeast(r, "manager"),
  content: (r?: AdminRole) => roleAtLeast(r, "manager"),
  pages: (r?: AdminRole) => roleAtLeast(r, "manager"),
  analytics: (r?: AdminRole) => roleAtLeast(r, "manager"),
  users: (r?: AdminRole) => roleAtLeast(r, "owner"),
  settings: (r?: AdminRole) => roleAtLeast(r, "owner"),
};
