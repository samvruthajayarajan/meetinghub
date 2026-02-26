import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Cache for user lookups (in-memory, resets on serverless restart)
const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.send'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Auth attempt for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }

          // Check cache first
          const cached = userCache.get(credentials.email);
          let user;

          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('✅ User found in cache');
            user = cached.user;
          } else {
            console.log('🔍 Fetching user from database...');
            // Fetch from database with minimal fields
            user = await prisma.user.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
              }
            });

            if (user) {
              console.log('✅ User found in database');
              // Cache the user
              userCache.set(credentials.email, { user, timestamp: Date.now() });
            } else {
              console.log('❌ User not found in database');
            }
          }

          if (!user) {
            return null;
          }
          
          console.log('🔑 Comparing passwords...');
          // Fast password comparison
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Authentication successful');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user with Gmail tokens
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                password: '', // No password for OAuth users
                role: 'user',
                gmailAccessToken: account.access_token,
                gmailRefreshToken: account.refresh_token,
                gmailTokenExpiry: account.expires_at ? new Date(account.expires_at * 1000) : null,
              }
            });
          } else {
            // Update existing user with Gmail tokens
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                gmailAccessToken: account.access_token,
                gmailRefreshToken: account.refresh_token,
                gmailTokenExpiry: account.expires_at ? new Date(account.expires_at * 1000) : null,
              }
            });
          }
          return true;
        } catch (error) {
          console.error('Error creating/updating user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
