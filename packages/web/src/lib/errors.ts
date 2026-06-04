import { ConvexError } from "convex/values";

const DEFAULT_FALLBACK = "حدث خطأ غير متوقع، يُرجى المحاولة مجددًا.";

/**
 * Extracts a clean, user-facing message from an error thrown by a Convex
 * function call.
 *
 * - `ConvexError`s carry their payload in `.data` — for our backend that is
 *   the Arabic message string, which we return as-is.
 * - Plain `Error`s thrown server-side arrive wrapped with Convex's transport
 *   noise (`[CONVEX M(...)] [Request ID: …] Server Error\nUncaught Error: …
 *   at handler (…)`). We strip that wrapper down to just the message so the
 *   user never sees request IDs or stack frames.
 *
 * Prefer throwing `ConvexError` on the backend for user-facing validation so
 * the message also survives production redaction — but this helper degrades
 * gracefully for either kind.
 */
export function getConvexErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (error instanceof ConvexError) {
    const data = error.data;
    if (typeof data === "string") return data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    return fallback;
  }

  if (error instanceof Error) {
    return stripConvexWrapper(error.message) || fallback;
  }

  return fallback;
}

/**
 * Pulls the human message out of a wrapped Convex error string. Returns an
 * empty string when nothing usable can be extracted so callers fall back.
 */
function stripConvexWrapper(message: string): string {
  // Take the text after the last "Uncaught …Error:" marker, then drop the
  // trailing stack (" at handler (…)" / newlines) that Convex appends.
  const marker = message.match(/Uncaught\s+\w*Error:\s*([\s\S]*)$/);
  let msg = marker ? marker[1] : message;
  msg = msg.split(/\n|\s+at\s+/)[0];
  return msg.trim();
}
