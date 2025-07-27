/**
 *
 * @param func The function to be debounced.
 * @param delay The delay in milliseconds to wait before executing the function.
 * @returns A debounced function that delays the execution of the provided function until after the specified delay.
 */
export function debounce(function_: () => void, delay: number): () => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function () {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function_, delay);
  };
}
