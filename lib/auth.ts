import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('=== AUTHORIZE CALLED ===');
          console.log('Credentials received:', credentials ? 'YES' : 'NO');
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials - email:', !!credentials?.email, 'password:', !!credentials?.password);
            return null;
          }

          console.log('Looking for user:', credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log('❌ User not found');
            return null;
          }

          console.log('✓ User found:', user.email);
          console.log('Password from form length:', credentials.password.length);
          console.log('Password from form (first 10 chars):', credentials.password.substring(0, 10));
          console.log('Stored hash (first 20 chars):', user.password.substring(0, 20));
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password comparison result:', isPasswordValid);
          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✓ Authentication successful, returning user object');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Error in authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
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
  },
};
