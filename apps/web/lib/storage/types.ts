export interface StorageBlob {
  pathname: string;
  size: number;
  uploadedAt?: Date;
}

export interface StorageAdapter {
  put(pathname: string, body: Buffer | string): Promise<void>;
  list(prefix: string): Promise<{ blobs: StorageBlob[] }>;
  del(pathnames: string[]): Promise<void>;
  getContent(pathname: string): Promise<Buffer | null>;
}
