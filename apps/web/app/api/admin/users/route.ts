import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminCredential } from '@/lib/session';
import { getStorageAdapter } from '@/lib/storage';

interface UserData {
  username: string;
  createdAt: string;
  isBlocked: boolean;
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.ADMIN_PASSWORD_HASH || !process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Admin configuration is not configured' }, { status: 500 });
    }

    const providedPassword = request.headers.get('x-manage-password');
    const cookieValue = request.cookies.get('admin_session')?.value;
    if (!isValidAdminCredential(providedPassword, cookieValue)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN && (process.env.STORAGE_PROVIDER ?? 'vercel-blob') !== 'local') {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 });
    }

    const storage = getStorageAdapter();
    const { blobs } = await storage.list('users/');
    const users: UserData[] = [];

    for (const blob of blobs) {
      const match = blob.pathname.match(/^users\/([^\/]+)\/profile\.json$/);
      if (match) {
        let isBlocked = false;
        try {
          const content = await storage.getContent(blob.pathname);
          if (content) {
            const profile = JSON.parse(content.toString('utf-8'));
            isBlocked = !!profile.isBlocked;
          }
        } catch (e) {
          console.error('Failed to fetch profile for', match[1]);
        }
        users.push({
          username: match[1],
          createdAt: (blob.uploadedAt ?? new Date()).toISOString(),
          isBlocked,
        });
      }
    }

    // Sort by created date, newest first by default
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[v0] Admin users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
