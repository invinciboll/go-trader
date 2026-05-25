import cv from "@techstark/opencv-js";

export function getErrorMessage(error: unknown): string {
  // 1. Standard JS Error
  if (error instanceof Error) {
    return error.message;
  }

  // 2. OpenCV WASM pointer error
  try {
    const maybePtr = error as any;

    if (maybePtr && typeof cv !== "undefined") {
      const cvErr = cv.exceptionFromPtr?.(maybePtr);
      if (cvErr?.msg) {
        return cvErr.msg;
      }
    }
  } catch {
    // ignore and fall through
  }

  // 3. Fallbacks
  if (typeof error === "string") return error;
  if (error && typeof error === "object") return JSON.stringify(error);

  return `Unknown error: ${String(error)}`;
}