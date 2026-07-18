/**
 * Seeds categories, ~10 products, banners, and the Settings singleton.
 * Idempotent: upserts by slug/key so re-running does not duplicate.
 *
 * Usage: npm run seed   (requires MONGODB_URI in the environment / .env.local)
 * Phase 4 extends this with sample customers, orders, and reviews.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { Settings } from "../src/models/Settings";
import { Coupon } from "../src/models/Coupon";
import { User } from "../src/models/User";
import { Order } from "../src/models/Order";
import { Review } from "../src/models/Review";
import { Banner } from "../src/models/Banner";
import { Page } from "../src/models/Page";

// Demo photos via picsum (deterministic per seed, always load). Real product
// images come via ImageKit uploads in the admin later.

type SeedProduct = {
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  care: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  leadTimeDays: number;
  isBestseller?: boolean;
  isCustomizable?: boolean;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  variants: {
    color: string;
    size?: string;
    customTextAllowed?: boolean;
    priceDelta?: number;
    stock: number | null;
  }[];
};

const img = (id: string) => `https://picsum.photos/seed/${encodeURIComponent(id)}/800/800`;

const categories = [
  { name: "Keychains", slug: "keychains", icon: "🔑", sortOrder: 1, description: "Handmade crochet keychains.", image: img("cat-keychains") },
  { name: "Flower Bouquets", slug: "bouquets", icon: "💐", sortOrder: 2, description: "Everlasting crochet bouquets.", image: img("cat-bouquets") },
  { name: "Bag Charms", slug: "bag-charms", icon: "🎀", sortOrder: 3, description: "Charms for bags & backpacks.", image: img("cat-bag-charms") },
  { name: "Soft Toys", slug: "soft-toys", icon: "🧸", sortOrder: 4, description: "Cuddly crochet amigurumi.", image: img("cat-soft-toys") },
  { name: "Accessories", slug: "accessories", icon: "🧶", sortOrder: 5, description: "Wearable crochet accessories.", image: img("cat-accessories") },
];

const products: SeedProduct[] = [
  {
    name: "Daisy Flower Keychain",
    slug: "daisy-flower-keychain",
    categorySlug: "keychains",
    description: "A cheerful hand-crocheted daisy keychain with a sturdy metal ring. Perfect little gift.",
    care: "Spot clean only. Keep away from water and direct heat.",
    images: [img("photo-1610177498573-0f2e0f7a0e0a"), img("photo-1516035069371-29a1b244cc32")],
    basePrice: 199,
    compareAtPrice: 279,
    leadTimeDays: 3,
    isBestseller: true,
    isCustomizable: true,
    tags: ["daisy", "flower", "gift", "keychain"],
    ratingAvg: 4.6,
    ratingCount: 128,
    variants: [
      { color: "White", customTextAllowed: true, stock: null },
      { color: "Yellow", customTextAllowed: true, stock: null },
      { color: "Pink", customTextAllowed: true, priceDelta: 20, stock: 5 },
    ],
  },
  {
    name: "Rose Bouquet (6 stems)",
    slug: "rose-bouquet-6-stems",
    categorySlug: "bouquets",
    description: "A forever bouquet of six crochet roses that never wilt. Wrapped and ready to gift.",
    care: "Dust gently with a soft brush.",
    images: [img("photo-1519378058457-4c29a0a2efac"), img("photo-1487070183336-b863922373d4")],
    basePrice: 1299,
    compareAtPrice: 1799,
    leadTimeDays: 7,
    isBestseller: true,
    tags: ["rose", "bouquet", "anniversary", "gift"],
    ratingAvg: 4.8,
    ratingCount: 74,
    variants: [
      { color: "Red", stock: null },
      { color: "Blush Pink", stock: null },
      { color: "Lavender", priceDelta: 100, stock: null },
    ],
  },
  {
    name: "Strawberry Bag Charm",
    slug: "strawberry-bag-charm",
    categorySlug: "bag-charms",
    description: "A juicy little strawberry charm to clip onto bags, backpacks and pencil cases.",
    care: "Spot clean only.",
    images: [img("photo-1464965911861-746a04b4bca6")],
    basePrice: 249,
    compareAtPrice: 329,
    leadTimeDays: 4,
    isCustomizable: true,
    tags: ["strawberry", "fruit", "charm", "cute"],
    ratingAvg: 4.4,
    ratingCount: 52,
    variants: [
      { color: "Red", customTextAllowed: false, stock: null },
      { color: "Green", stock: 8 },
    ],
  },
  {
    name: "Bunny Amigurumi",
    slug: "bunny-amigurumi",
    categorySlug: "soft-toys",
    description: "A soft, huggable crochet bunny with floppy ears. Safe stuffing, embroidered eyes.",
    care: "Surface wash. Do not machine wash.",
    images: [img("photo-1558877385-8c1b8b3f6d0e"), img("photo-1607453998774-d533f65dac99")],
    basePrice: 899,
    compareAtPrice: 1199,
    leadTimeDays: 6,
    isBestseller: true,
    tags: ["bunny", "rabbit", "amigurumi", "toy"],
    ratingAvg: 4.9,
    ratingCount: 96,
    variants: [
      { color: "Cream", size: "Small", stock: null },
      { color: "Cream", size: "Large", priceDelta: 400, stock: null },
      { color: "Grey", size: "Small", stock: null },
    ],
  },
  {
    name: "Granny Square Scrunchie",
    slug: "granny-square-scrunchie",
    categorySlug: "accessories",
    description: "A retro granny-square scrunchie in soft cotton yarn. Gentle on hair.",
    care: "Hand wash cold, lay flat to dry.",
    images: [img("photo-1596462502278-27bfdc403348")],
    basePrice: 149,
    leadTimeDays: 2,
    tags: ["scrunchie", "hair", "granny square"],
    ratingAvg: 4.3,
    ratingCount: 41,
    variants: [
      { color: "Multicolor", stock: 12 },
      { color: "Pastel", stock: 6 },
    ],
  },
  {
    name: "Sunflower Keychain",
    slug: "sunflower-keychain",
    categorySlug: "keychains",
    description: "Bright hand-crocheted sunflower keychain to carry a little sunshine everywhere.",
    care: "Spot clean only.",
    images: [img("photo-1470509037663-253afd7f0f51")],
    basePrice: 219,
    compareAtPrice: 299,
    leadTimeDays: 3,
    isCustomizable: true,
    tags: ["sunflower", "flower", "keychain", "gift"],
    ratingAvg: 4.5,
    ratingCount: 63,
    variants: [
      { color: "Yellow", customTextAllowed: true, stock: null },
      { color: "Orange", customTextAllowed: true, stock: null },
    ],
  },
  {
    name: "Tulip Bunch (3 stems)",
    slug: "tulip-bunch-3-stems",
    categorySlug: "bouquets",
    description: "A dainty bunch of three crochet tulips — a sweet desk companion.",
    care: "Dust gently.",
    images: [img("photo-1520763185298-1b434c919102")],
    basePrice: 699,
    compareAtPrice: 899,
    leadTimeDays: 5,
    tags: ["tulip", "bouquet", "desk", "gift"],
    ratingAvg: 4.2,
    ratingCount: 28,
    variants: [
      { color: "Pink", stock: null },
      { color: "Yellow", stock: null },
      { color: "Purple", stock: null },
    ],
  },
  {
    name: "Cloud Bag Charm",
    slug: "cloud-bag-charm",
    categorySlug: "bag-charms",
    description: "A fluffy little cloud charm with a rainbow tail. Cheerful clip-on for any bag.",
    care: "Spot clean only.",
    images: [img("photo-1622445275576-721325763afe")],
    basePrice: 279,
    leadTimeDays: 4,
    tags: ["cloud", "rainbow", "charm"],
    ratingAvg: 4.7,
    ratingCount: 37,
    variants: [
      { color: "White", stock: null },
      { color: "Sky Blue", stock: 4 },
    ],
  },
  {
    name: "Elephant Amigurumi",
    slug: "elephant-amigurumi",
    categorySlug: "soft-toys",
    description: "A gentle crochet elephant with a tiny trunk. Great nursery companion.",
    care: "Surface wash only.",
    images: [img("photo-1503919545889-aef636e10ad4")],
    basePrice: 999,
    compareAtPrice: 1299,
    leadTimeDays: 7,
    tags: ["elephant", "amigurumi", "toy", "nursery"],
    ratingAvg: 4.8,
    ratingCount: 55,
    variants: [
      { color: "Grey", stock: null },
      { color: "Mint", priceDelta: 100, stock: null },
    ],
  },
  {
    name: "Crochet Flower Coasters (set of 4)",
    slug: "crochet-flower-coasters-set-of-4",
    categorySlug: "accessories",
    description: "A set of four floral crochet coasters in soft cotton. Adds handmade warmth to any table.",
    care: "Hand wash cold, lay flat to dry.",
    images: [img("photo-1493663284031-b7e3aefcae8e")],
    basePrice: 449,
    compareAtPrice: 599,
    leadTimeDays: 5,
    tags: ["coasters", "home", "flower", "set"],
    ratingAvg: 4.1,
    ratingCount: 19,
    variants: [
      { color: "Pastel Mix", stock: 10 },
      { color: "Earth Tones", stock: 7 },
    ],
  },
];

const banners = [
  {
    image: img("photo-1519378058457-4c29a0a2efac"),
    headline: "Forever bouquets, handmade to order",
    subtext: "Crochet flowers that never wilt",
    ctaText: "Shop bouquets",
    ctaLink: "/shop/bouquets",
    sortOrder: 1,
    isActive: true,
  },
  {
    image: img("photo-1558877385-8c1b8b3f6d0e"),
    headline: "Meet your new cuddle buddy",
    subtext: "Soft, safe amigurumi toys",
    ctaText: "Shop soft toys",
    ctaLink: "/shop/soft-toys",
    sortOrder: 2,
    isActive: true,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required to seed.");
  await mongoose.connect(uri);
  console.log("Connected. Seeding…");

  // Categories
  const catIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  for (const c of categories) {
    const doc = await Category.findOneAndUpdate({ slug: c.slug }, c, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }).exec();
    catIdBySlug.set(c.slug, doc._id as mongoose.Types.ObjectId);
  }
  console.log(`  ✓ ${categories.length} categories`);

  // Products
  for (const p of products) {
    const categoryId = catIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.categorySlug}`);
    const { categorySlug, ...rest } = p;
    void categorySlug;
    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        ...rest,
        category: categoryId,
        variants: p.variants.map((v) => ({
          color: v.color,
          size: v.size,
          customTextAllowed: !!v.customTextAllowed,
          priceDelta: v.priceDelta ?? 0,
          stock: v.stock,
        })),
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }
  console.log(`  ✓ ${products.length} products`);

  // Settings singleton (+ banners stored inline for now; Banner model arrives in Phase 5)
  await Settings.findOneAndUpdate(
    { key: "singleton" },
    { key: "singleton" },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();
  console.log("  ✓ settings singleton");

  // Banners
  for (const b of banners) {
    await Banner.findOneAndUpdate({ headline: b.headline }, b, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }).exec();
  }
  console.log(`  ✓ ${banners.length} banners`);

  // Policy / info pages
  const pages = [
    { slug: "about", title: "About Lara's Pinnal", bodyHtml: "<p>We are a small handmade crochet studio in Tamil Nadu. Every piece is hand-crocheted to order with love.</p>" },
    { slug: "shipping", title: "Shipping", bodyHtml: "<p>Most items are made to order and ship within their listed lead time. Free shipping over ₹999.</p>" },
    { slug: "refund", title: "Returns & Refunds", bodyHtml: "<p>As items are handmade to order, we accept returns only for damaged or incorrect items. Contact us within 3 days of delivery.</p>" },
    { slug: "privacy", title: "Privacy Policy", bodyHtml: "<p>We only use your details to fulfil and deliver your orders.</p>" },
    { slug: "terms", title: "Terms of Service", bodyHtml: "<p>By ordering you agree to our made-to-order lead times and policies.</p>" },
    { slug: "faq", title: "FAQ", bodyHtml: "<h2>How long does an order take?</h2><p>Each product lists its lead time in days.</p>" },
    { slug: "contact", title: "Contact", bodyHtml: "<p>Reach us on WhatsApp or email hello@laraspinnal.in.</p>" },
  ];
  for (const p of pages) {
    await Page.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
  }
  console.log(`  ✓ ${pages.length} policy pages`);

  // Coupons
  const coupons = [
    { code: "WELCOME10", type: "percentage" as const, value: 10, minOrderValue: 300, isActive: true },
    { code: "FLAT100", type: "flat" as const, value: 100, minOrderValue: 700, isActive: true },
  ];
  for (const c of coupons) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }).exec();
  }
  console.log(`  ✓ ${coupons.length} coupons`);

  // Sample customers, orders, reviews (so account/order/tracking screens are testable)
  const prods = await Product.find().lean().exec();
  const bySlug = new Map(prods.map((p) => [p.slug, p]));
  const daisy = bySlug.get("daisy-flower-keychain")!;
  const bunny = bySlug.get("bunny-amigurumi")!;
  const rose = bySlug.get("rose-bouquet-6-stems")!;

  const ashaAddr = {
    fullName: "Asha Ramesh",
    phone: "9876543210",
    line1: "12 Beach Road",
    line2: "Besant Nagar",
    landmark: "Near the temple",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600090",
    type: "home" as const,
    isDefault: true,
  };

  const asha = await User.findOneAndUpdate(
    { email: "asha@example.com" },
    {
      name: "Asha Ramesh",
      email: "asha@example.com",
      phone: "9876543210",
      passwordHash: await bcrypt.hash("password123", 10),
      emailVerified: true,
      phoneVerified: true,
      addresses: [ashaAddr],
      wishlist: [rose._id],
      notificationPrefs: { whatsapp: true, email: true },
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();
  if (asha.addresses[0]) {
    asha.defaultAddressId = asha.addresses[0]._id;
    await asha.save();
  }

  const meena = await User.findOneAndUpdate(
    { phone: "9812345678" },
    {
      name: "Meena K",
      phone: "9812345678",
      phoneVerified: true,
      addresses: [
        {
          fullName: "Meena K",
          phone: "9812345678",
          line1: "5 Gandhi Street",
          city: "Coimbatore",
          state: "Tamil Nadu",
          pincode: "641001",
          type: "home",
          isDefault: true,
        },
      ],
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  console.log("  ✓ 2 sample customers (asha@example.com / password123, phone 9812345678)");

  // Orders for Asha across fulfillment states (idempotent by orderNumber).
  const line = (p: typeof daisy, qty: number, price: number) => ({
    productId: p._id,
    name: p.name,
    variant: { color: p.variants[0]?.color ?? "" },
    quantity: qty,
    price,
  });
  const now = Date.now();
  const days = (n: number) => new Date(now - n * 86400000);

  const orders = [
    {
      orderNumber: "LP-2026-9001",
      userId: asha._id,
      total: daisy.basePrice * 2 + 49,
      subtotal: daisy.basePrice * 2,
      shipping: 49,
      items: [line(daisy, 2, daisy.basePrice)],
      paymentMethod: "razorpay" as const,
      paymentStatus: "paid" as const,
      fulfillmentStatus: "delivered" as const,
      trackingNumber: "TN123456789IN",
      courierName: "India Post",
      statusHistory: [
        { status: "placed", at: days(12) },
        { status: "in_progress", at: days(10) },
        { status: "ready", at: days(8) },
        { status: "shipped", at: days(6), note: "India Post · TN123456789IN" },
        { status: "delivered", at: days(3) },
      ],
    },
    {
      orderNumber: "LP-2026-9002",
      userId: asha._id,
      total: bunny.basePrice + 49,
      subtotal: bunny.basePrice,
      shipping: 49,
      items: [line(bunny, 1, bunny.basePrice)],
      paymentMethod: "razorpay" as const,
      paymentStatus: "paid" as const,
      fulfillmentStatus: "shipped" as const,
      trackingNumber: "TN987654321IN",
      courierName: "DTDC",
      statusHistory: [
        { status: "placed", at: days(5) },
        { status: "in_progress", at: days(4) },
        { status: "ready", at: days(2) },
        { status: "shipped", at: days(1), note: "DTDC · TN987654321IN" },
      ],
    },
    {
      orderNumber: "LP-2026-9003",
      userId: asha._id,
      total: rose.basePrice,
      subtotal: rose.basePrice,
      shipping: 0,
      items: [line(rose, 1, rose.basePrice)],
      paymentMethod: "cod" as const,
      paymentStatus: "pending" as const,
      fulfillmentStatus: "placed" as const,
      statusHistory: [{ status: "placed", at: days(0) }],
    },
  ];

  for (const o of orders) {
    const ready = new Date(now + 5 * 86400000);
    await Order.findOneAndUpdate(
      { orderNumber: o.orderNumber },
      {
        ...o,
        customer: { name: "Asha Ramesh", phone: "9876543210", email: "asha@example.com" },
        shippingAddress: { ...ashaAddr },
        discount: 0,
        estimatedReadyBy: ready,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }
  console.log(`  ✓ ${orders.length} sample orders for Asha (delivered / shipped / placed)`);

  // Reviews (approved so they show on the PDP; one verified purchase).
  const reviews = [
    { productId: daisy._id, userId: asha._id, name: "Asha Ramesh", rating: 5, text: "Adorable and so well made. Arrived quickly!", isApproved: true, verifiedPurchase: true },
    { productId: bunny._id, name: "Priya S", rating: 5, text: "My daughter loves this bunny. Super soft.", isApproved: true, verifiedPurchase: false },
    { productId: rose._id, name: "Karthik", rating: 4, text: "Beautiful bouquet, lasts forever.", isApproved: true, verifiedPurchase: false },
  ];
  for (const r of reviews) {
    await Review.findOneAndUpdate(
      { productId: r.productId, name: r.name },
      r,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }
  console.log(`  ✓ ${reviews.length} approved reviews`);

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
