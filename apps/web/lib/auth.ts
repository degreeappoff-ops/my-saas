import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma"; // ⚠️ chemin relatif vers ton client Prisma

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // 1) Vérifier que les champs sont présents
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2) Récupérer l'utilisateur en base
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // pas d'utilisateur ou pas de mot de passe stocké
          return null;
        }

        // 3) Comparer le mot de passe envoyé avec le hash en base
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // 4) Retourner un objet "user" que NextAuth peut mettre dans le token
        return {
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          role: user.role, // USER / PRO / ADMIN
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Au premier login, "user" est défini → on copie le rôle dans le token
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // On propage quelques infos utiles dans session.user
      if (token?.sub) {
        (session.user as any).id = token.sub;
      }
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
