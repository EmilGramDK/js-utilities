/**
 *
 * @param func The function to be throttled.
 * @param limit The time in milliseconds to wait before allowing the function to be called again.
 * @returns A throttled function that limits the rate at which the provided function can be called.
 */
export function throttle(func: () => void, limit: number): () => void {
  let inThrottle: boolean;
  return function () {
    if (!inThrottle) {
      func();
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
