import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { User } from "@/models/User";
import { verifyOtp } from "./otp";

/**
 * User authentication (customers). Two credential providers resolve to the same
 * User record: email+password and phone+OTP. Admin auth is separate (Phase 5).
 * Session strategy is JWT carrying { userId, name }.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: creds.email.toLowerCase().trim(), isActive: true }).exec();
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;
        user.lastLoginAt = new Date();
        await user.save();
        return { id: String(user._id), name: user.name, email: user.email };
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "Phone OTP",
      credentials: { phone: { type: "text" }, code: { type: "text" }, name: { type: "text" } },
      async authorize(creds) {
        if (!creds?.phone || !creds?.code) return null;
        const phone = creds.phone.trim();
        const res = await verifyOtp(phone, creds.code.trim(), "login");
        if (!res.ok) return null;
        await dbConnect();
        // Phone login is register-on-first-login: create the user if absent.
        let user = await User.findOne({ phone }).exec();
        if (!user) {
          user = await User.create({
            name: creds.name?.trim() || "Customer",
            phone,
            phoneVerified: true,
            isActive: true,
          });
        }
        user.phoneVerified = true;
        user.lastLoginAt = new Date();
        await user.save();
        return { id: String(user._id), name: user.name, phone: user.phone };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as { id: string }).id;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as string;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
  },
};

/** Returns the logged-in user's id, or null. Server-side. */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.userId ?? null;
}
