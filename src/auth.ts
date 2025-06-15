import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"
import Crendetials from "next-auth/providers/credentials"
import { LoginSchema } from "@/validasi/auth"
import { compareSync } from "bcrypt-ts"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Crendetials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
          const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        })

        if (!user || !user.password) {
          throw new Error("User not found");
        }
        
        const passwordMatch = compareSync(password, user.password);

        if (!passwordMatch) return null;

        return user;
      }
    })  
  ],
  callbacks: {
    authorized({auth, request: {nextUrl}}) {
      const isLoggedIn = !!auth?.user;
      const ProtectedRoutes = ["/dashbaoard", "/profile"]

      if (!isLoggedIn && ProtectedRoutes.includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/profile", nextUrl))
      }
      return true;
    },
    jwt({token, user}) {
      if(user) token.role = user.role;
      return token;
    },
    session({session, token}) {
      session.user.id = token.sub;
      session.user.role = token.role
      return session;
    }
  },
})