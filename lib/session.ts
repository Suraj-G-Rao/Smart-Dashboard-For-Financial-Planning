import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Get the current user session or redirect to sign in
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  return session;
}

/**
 * Get the current user session or return null
 */
export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Get the current user ID or throw error
 */
export async function getUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}
