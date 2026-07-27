export interface SecretsProvider {
  readonly name: string;
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  rotate(key: string): Promise<string>;
}