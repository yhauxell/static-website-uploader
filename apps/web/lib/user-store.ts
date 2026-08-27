import { scryptSync, randomBytes } from 'crypto';
import { getStorageAdapter } from '@/lib/storage';

export interface UserProfile {
  username: string;
  passwordHash: string; // "salt:hash"
  apiKeyVersion: number;
  isBlocked?: boolean;
}

/**
 * Hash a plaintext password using scrypt
 */
export function hashUserPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function getUserBlobPath(username: string): string {
  // Simple sanitize to prevent injection in paths
  const safeName = username.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  return `users/${safeName}/profile.json`;
}

/**
 * Checks if a user profile exists
 */
export async function userExists(username: string): Promise<boolean> {
  try {
    const blobPath = getUserBlobPath(username);
    const content = await getStorageAdapter().getContent(blobPath);
    return content !== null;
  } catch {
    return false;
  }
}

/**
 * Creates a new user profile in storage
 */
export async function createUser(username: string, passwordHash: string): Promise<UserProfile> {
  const profile: UserProfile = {
    username,
    passwordHash,
    apiKeyVersion: 0,
  };
  
  await getStorageAdapter().put(getUserBlobPath(username), JSON.stringify(profile));
  
  return profile;
}

/**
 * Fetches an existing user profile from storage
 */
export async function getUser(username: string): Promise<UserProfile | null> {
  try {
    const blobPath = getUserBlobPath(username);
    const content = await getStorageAdapter().getContent(blobPath);
    if (!content) return null;
    return JSON.parse(content.toString('utf-8')) as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Updates a user profile
 */
export async function updateUser(profile: UserProfile): Promise<UserProfile> {
  await getStorageAdapter().put(getUserBlobPath(profile.username), JSON.stringify(profile));
  return profile;
}

/**
 * Deletes a user profile from storage
 */
export async function deleteUser(username: string): Promise<void> {
  const blobPath = getUserBlobPath(username);
  await getStorageAdapter().del([blobPath]);
}
