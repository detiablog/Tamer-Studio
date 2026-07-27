export function successResponse<T>(data: T, message?: string) {
  const result: { success: true; data: T; message?: string } = {
    success: true,
    data,
  };
  if (message) {
    result.message = message;
  }
  return result;
}

export function paginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export function errorResponse(code: string, message: string, details?: Record<string, unknown>) {
  const result: { success: false; error: { code: string; message: string; details?: Record<string, unknown> } } = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    result.error.details = details;
  }
  return result;
}