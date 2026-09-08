import fs from 'fs';
import path from 'path';
import type { StorageAdapter, StorageBlob } from './types';

function getStorageRoot(): string {
  return path.resolve(process.env.STORAGE_LOCAL_PATH ?? './data/artifacts');
}

function safePath(storageRoot: string, pathname: string): string | null {
  const normalized = path.normalize(pathname).replace(/\\/g, '/');
  if (path.isAbsolute(normalized)) {
    return null;
  }
  const full = path.join(storageRoot, normalized);
  if (!full.startsWith(storageRoot + path.sep) && full !== storageRoot) {
    return null;
  }
  return full;
}

async function walkDir(dir: string, storageRoot: string): Promise<StorageBlob[]> {
  const blobs: StorageBlob[] = [];
  if (!fs.existsSync(dir)) return blobs;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      blobs.push(...(await walkDir(full, storageRoot)));
    } else {
      const stat = fs.statSync(full);
      blobs.push({
        pathname: path.relative(storageRoot, full).replace(/\\/g, '/'),
        size: stat.size,
        uploadedAt: stat.mtime,
      });
    }
  }
  return blobs;
}

export class LocalStorageAdapter implements StorageAdapter {
  async put(pathname: string, body: Buffer | string): Promise<void> {
    const storageRoot = getStorageRoot();
    const full = safePath(storageRoot, pathname);
    if (!full) throw new Error(`Directory traversal attempt detected: ${pathname}`);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }

  async list(prefix: string): Promise<{ blobs: StorageBlob[] }> {
    const storageRoot = getStorageRoot();
    const allBlobs = await walkDir(storageRoot, storageRoot);
    const blobs = allBlobs.filter((b) => b.pathname.startsWith(prefix));
    return { blobs };
  }

  async del(pathnames: string[]): Promise<void> {
    const storageRoot = getStorageRoot();
    for (const pathname of pathnames) {
      const full = safePath(storageRoot, pathname);
      if (!full) continue;
      if (fs.existsSync(full)) fs.unlinkSync(full);
      // Clean up empty parent directories up to the storage root
      let dir = path.dirname(full);
      while (dir !== storageRoot && dir.startsWith(storageRoot)) {
        if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
          fs.rmdirSync(dir);
          dir = path.dirname(dir);
        } else {
          break;
        }
      }
    }
  }

  async getContent(pathname: string): Promise<Buffer | null> {
    const storageRoot = getStorageRoot();
    const full = safePath(storageRoot, pathname);
    if (!full) return null;
    if (!fs.existsSync(full)) return null;
    return fs.readFileSync(full);
  }
}
