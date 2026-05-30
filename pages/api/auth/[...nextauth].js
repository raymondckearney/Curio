import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.username === 'admin' &&
          credentials?.password === process.env.ADMIN_SECRET
        ) {
          return { id: '1', name: 'Admin' };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};

export default NextAuth(authOptions);
