import { authMiddleware } from '@clerk/nextjs';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See [https://clerk.com/docs/references/nextjs/auth-middleware](https://clerk.com/docs/references/nextjs/auth-middleware) for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ['/', '/products(.*)', '/sign-in(.*)', '/sign-up(.*)', '/api/webhooks/stripe'],
  // Routes that can always be accessed, and have no authentication information
  // ignoredRoutes: ['/no-auth-in-this-route'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
