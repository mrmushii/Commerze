import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  redirect('/admin/dashboard');
  // This component will not actually render anything visible,
  // as it immediately redirects.
  return null;
}