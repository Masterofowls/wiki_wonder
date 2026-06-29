import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createDb, users } from "@wikiwonder/db";

const credentialsSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
});

function getAuthDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return createDb(url);
}

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "Username and Password",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const db = getAuthDb();
        if (!db) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, parsed.data.username))
          .limit(1);

        if (!user) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.displayName ?? user.username,
          username: user.username,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
});

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}
