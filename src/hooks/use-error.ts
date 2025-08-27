import { onError, onUnhandledRejection } from "../dom";

export const useErrorHandler = (func: (error: Error) => void) => {
  const handler = (event: ErrorEvent | PromiseRejectionEvent) => {
    const eventErr = event instanceof ErrorEvent ? event.error : event.reason;
    const error =
      eventErr instanceof Error ? eventErr : new Error(eventErr?.toString() || "Unknown error");
    if (error?.name === "AbortError") return;
    func(error);
  };
  onError(handler);
  onUnhandledRejection(handler);
};
