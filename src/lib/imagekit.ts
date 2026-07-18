import ImageKit from "imagekit";

// Server-side ImageKit client for signed upload auth. Keys stay server-side;
// only the short-lived signature/token + the public key/endpoint reach the
// (authenticated admin) client.
let client: ImageKit | null = null;

export function imagekitConfigured(): boolean {
  return !!(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}

export function getImageKit(): ImageKit {
  if (!imagekitConfigured()) throw new Error("ImageKit is not configured.");
  if (!client) {
    client = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });
  }
  return client;
}
