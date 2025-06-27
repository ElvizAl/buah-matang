import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"
import Crendetials from "next-auth/providers/credentials"
import { LoginSchema } from "@/validasi/auth"
import { compareSync } from "bcrypt-ts"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
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
        const validatedFields = LoginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!user || !user.password) {
          throw new Error("User not found")
        }

        const passwordMatch = compareSync(password, user.password)

        if (!passwordMatch) return null

        return user
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const userRole = auth?.user?.role

      console.log("Auth check:", { isLoggedIn, userRole, pathname: nextUrl.pathname })

      // Protected routes
      const protectedRoutes = ["/dashboard", "/profile"]
      const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))

      // If not logged in and accessing protected route
      if (!isLoggedIn && isProtectedRoute) {
        console.log("Redirecting to login - not authenticated")
        return Response.redirect(new URL("/login", nextUrl))
      }

      // If logged in and accessing login page
      if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
        console.log("User logged in, redirecting based on role:", userRole)
        if (userRole === "admin") {
          return Response.redirect(new URL("/dashboard", nextUrl))
        } else {
          return Response.redirect(new URL("/profile", nextUrl))
        }
      }

      // If user (not admin) trying to access dashboard
      if (isLoggedIn && userRole !== "admin" && nextUrl.pathname.startsWith("/dashboard")) {
        console.log("Non-admin trying to access dashboard, redirecting to home")
        return Response.redirect(new URL("/profile", nextUrl))
      }

      // If admin accessing root path, redirect to dashboard
      if (isLoggedIn && userRole === "admin" && nextUrl.pathname === "/") {
        console.log("Admin accessing root, redirecting to dashboard")
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        console.log("JWT callback - setting role:", user.role)
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      if (token.role) {
        session.user.role = token.role as string
      }
      console.log("Session callback:", { userId: session.user.id, role: session.user.role })
      return session
    },
  },
})
