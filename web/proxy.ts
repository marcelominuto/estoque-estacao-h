import { withAuth } from 'next-auth/middleware';

const proxy = withAuth({
  pages: { signIn: '/login' },
  callbacks: {
    authorized: ({ token }) => token?.role === 'ADMIN',
  },
});

export default proxy;

export const config = {
  matcher: ['/estoque/:path*', '/motos/:path*', '/api/fipe/:path*', '/api/motos/:path*'],
};
