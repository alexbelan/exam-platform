// Type for API errors that can come from tRPC or other sources
export type ApiError =
  | { data: { statusMessage: string } }
  | { statusMessage: string }
  | { message: string }
  | Error
  | unknown;

/**
 * Extracts error message from various error formats
 * @param error - Error object that can be in different formats
 * @param fallback - Fallback message if no error message found
 * @returns Error message string
 */
export function extractErrorMessage(error: ApiError, fallback: string): string {
  // Check for tRPC error with data.statusMessage
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "statusMessage" in error.data &&
    typeof error.data.statusMessage === "string"
  ) {
    return error.data.statusMessage;
  }

  // Check for error with statusMessage
  if (
    error &&
    typeof error === "object" &&
    "statusMessage" in error &&
    typeof error.statusMessage === "string"
  ) {
    return error.statusMessage;
  }

  // Check for error with message property
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // Fallback to provided fallback message
  return fallback;
}
