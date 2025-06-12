// app/user-profile/[[...user-profile]]/page.tsx
import { UserProfile } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server'; // For server-side authentication check
import { redirect } from 'next/navigation'; // For redirection if not signed in

export default async function UserProfilePage() { // Mark as async
  // Server-side check for authentication to ensure user is logged in
  // FIX: Await the auth() call to get the resolved object
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in'); // Redirect to sign-in page if not authenticated
  }

  return (
    <div className="flex justify-center items-center py-10 px-4"> {/* Centered layout */}
      {/* Clerk's <UserProfile /> component provides a complete UI for users
        to manage their profile details, security, connected accounts, etc.
      */}
      <UserProfile path="/user-profile" routing="path" />
    </div>
  );
}
