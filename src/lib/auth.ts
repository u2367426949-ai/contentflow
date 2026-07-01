import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId || null;
  } catch {
    return null;
  }
}

/**
 * Resolve a user's email for notifications. `User.email` isn't populated at
 * signup (no Clerk webhook wired up), so this fetches it from Clerk on first
 * need and caches it on the User row to avoid repeat API calls.
 */
export async function getUserEmail(clerkId: string, cachedEmail?: string | null): Promise<string | null> {
  if (cachedEmail) return cachedEmail;
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || null;
    if (email) {
      await prisma.user.update({ where: { clerkId }, data: { email } }).catch(() => {});
    }
    return email;
  } catch {
    return null;
  }
}
