import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      role?: string | null;
    };
  }
  interface User {
    role?: string | null;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // optionnel : ajouter un rôle
      session.user = { ...(session.user ?? {}), role: (token as any).role ?? "PRO" };
      return session;
    },
  },
});

export { handler as GET, handler as POST };

