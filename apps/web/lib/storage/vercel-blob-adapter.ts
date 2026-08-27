import { put, list, del, head } from '@vercel/blob';
import type { StorageAdapter, StorageBlob } from './types';

export class VercelBlobAdapter implements StorageAdapter {
  async put(pathname: string, body: Buffer | string): Promise<void> {
    await put(pathname, body, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
  }

  async list(prefix: string): Promise<{ blobs: StorageBlob[] }> {
    const result = await list({ prefix });
    return {
      blobs: result.blobs.map((b) => ({
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
      })),
    };
  }

  async del(pathnames: string[]): Promise<void> {
    await del(pathnames);
  }

  async getContent(pathname: string): Promise<Buffer | null> {
    try {
      const metadata = await head(pathname);
      if (!metadata) return null;
      const response = await fetch(metadata.url, { cache: 'no-store' });
      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return null;
    }
  }
}
