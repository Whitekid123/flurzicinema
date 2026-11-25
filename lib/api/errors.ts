// Shared API error shape. Backend must return this structure
// (see docs/BACKEND_API_CONTRACTS.md). Frontend maps `code` to UX;
// `message` is safe to surface, `details` are for debugging only.
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  requestId?: string;
  details?: unknown;
}

export class ServiceError extends Error implements ApiError {
  code: string;
  status?: number;
  requestId?: string;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ServiceError";
    this.code = error.code;
    this.status = error.status;
    this.requestId = error.requestId;
    this.details = error.details;
  }
}

export function toServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const value = error as ApiError;
    return new ServiceError({ code: String(value.code), message: String(value.message), status: value.status, requestId: value.requestId, details: value.details });
  }
  return new ServiceError({ code: "UNKNOWN", message: "Something unexpected happened." });
}

export const ErrorCodes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  EMAIL_VERIFICATION_REQUIRED: "EMAIL_VERIFICATION_REQUIRED",
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  RATE_LIMITED: "RATE_LIMITED",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;
