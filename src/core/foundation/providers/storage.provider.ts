export interface StorageProvider {
  readonly name: string;
  upload(bucket: string, key: string, data: Buffer | string, contentType?: string): Promise<string>;
  download(bucket: string, key: string): Promise<Buffer | null>;
  delete(bucket: string, key: string): Promise<void>;
  getUrl(bucket: string, key: string, expiresInMs?: number): Promise<string>;
}