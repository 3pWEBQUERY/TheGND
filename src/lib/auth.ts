import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      userType: string
      onboardingStatus: string
    }
  }
  
  interface JWT {
    id: string
    email: string
    userType: string
    onboardingStatus: string
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          onboardingStatus: user.onboardingStatus
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: any; user: any; trigger?: string; session?: any }) {
      // On sign-in set values from the authenticated user
      if (user) {
        token.id = user.id
        token.email = user.email
        token.userType = user.userType
        token.onboardingStatus = user.onboardingStatus
      }

      // If session.update() was called, merge provided fields
      if (trigger === 'update' && session?.user) {
        if (session.user.userType) token.userType = session.user.userType
        if (session.user.onboardingStatus) token.onboardingStatus = session.user.onboardingStatus
      }

      // Always sync from DB to ensure latest email/userType/onboardingStatus
      if (token?.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { email: true, userType: true, onboardingStatus: true },
          })
          if (dbUser) {
            token.email = dbUser.email
            token.userType = dbUser.userType
            token.onboardingStatus = dbUser.onboardingStatus
          }
        } catch (e) {
          // ignore db sync errors to avoid breaking auth flow
        }
      }

      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.userType = token.userType as string
        session.user.onboardingStatus = token.onboardingStatus as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

export default NextAuth(authOptions)