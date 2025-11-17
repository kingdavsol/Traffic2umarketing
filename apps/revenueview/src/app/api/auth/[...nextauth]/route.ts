import NextAuth from 'next-auth';
import { authOptions } from '@traffic2u/auth';
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
