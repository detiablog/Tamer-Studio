export interface Repository<T, CreateInput = unknown, UpdateInput = unknown, IdType = string> {
  findById(id: IdType): Promise<T | undefined>;
  findMany(filter?: FilterInput): Promise<T[]>;
  create(input: CreateInput): Promise<T>;
  update(id: IdType, input: UpdateInput): Promise<T | undefined>;
  delete(id: IdType): Promise<void>;
  exists(id: IdType): Promise<boolean>;
  count(filter?: FilterInput): Promise<number>;
  transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}

export interface FilterInput {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  [key: string]: unknown;
}
