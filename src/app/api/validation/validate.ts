import type { RequestDto } from "@/app/api/dto/BaseDto";
import { AppError } from "@/app/api/errors/AppError";

export function validateRequest(dto: RequestDto, data: unknown) {
  const result = dto.validate(data);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const messages = Object.values(fieldErrors).flat().filter(Boolean) as string[];
    throw new AppError("VALIDATION_ERROR", messages.join("; "), 422, { fieldErrors });
  }
  return result.data;
}