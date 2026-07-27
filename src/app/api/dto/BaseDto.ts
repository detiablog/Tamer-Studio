import { z } from "zod";

export abstract class RequestDto {
  abstract readonly schema: z.ZodSchema;

  validate(data: unknown) {
    return this.schema.safeParse(data);
  }
}

export abstract class ResponseDto {
  abstract readonly schema: z.ZodSchema;

  validate(data: unknown) {
    return this.schema.safeParse(data);
  }
}

export function createRequestSchema<T extends Record<string, z.ZodType>>(fields: T) {
  return z.object(fields).strict();
}

export function createResponseSchema<T extends Record<string, z.ZodType>>(fields: T) {
  return z.object(fields).strict();
}