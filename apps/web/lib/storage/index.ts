import type { StorageAdapter } from './types';
import { VercelBlobAdapter } from './vercel-blob-adapter';
import { LocalStorageAdapter } from './local-adapter';

export type { StorageAdapter, StorageBlob } from './types';

const provider = (process.env.STORAGE_PROVIDER ?? 'vercel-blob').toLowerCase();
const _adapter: StorageAdapter = provider === 'local'
  ? new LocalStorageAdapter()
  : new VercelBlobAdapter();

export function getStorageAdapter(): StorageAdapter {
  return _adapter;
}
