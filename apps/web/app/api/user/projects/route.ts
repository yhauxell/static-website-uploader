import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession, validateApiKeySignature } from '@/lib/session';
import { getStorageAdapter } from '@/lib/storage';

function getUsername(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const keyInfo = validateApiKeySignature(token);
    if (keyInfo) {
      return keyInfo.username;
    }
  }
  const cookieValue = request.cookies.get('auth_session')?.value;
  return validateUserSession(cookieValue);
}

export async function GET(request: NextRequest) {
  try {
    const username = getUsername(request);

    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN && (process.env.STORAGE_PROVIDER ?? 'vercel-blob') !== 'local') {
      return NextResponse.json({ error: 'Blob storage is not configured' }, { status: 500 });
    }

    const storage = getStorageAdapter();
    const { blobs } = await storage.list('projects/');

    const metadataPromises = blobs
      .filter((blob) => blob.pathname.endsWith('/metadata.json'))
      .map(async (blob) => {
        try {
          const content = await storage.getContent(blob.pathname);
          if (!content) return null;
          const data = JSON.parse(content.toString('utf-8'));
          return { ...data, _pathname: blob.pathname };
        } catch {
          return null;
        }
      });

    const allMetadata = await Promise.all(metadataPromises);

    const userProjects = allMetadata.filter(
      (m) => m && m.owner === username
    );

    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error('List user projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
