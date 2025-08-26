/**
 * The result of an individual bulk operation.
 */
type BulkResult<T, E> = {
  id: string;
  success: boolean;
  data?: T;
  error?: E;
};

/**
 * Processes an array of items in parallel using a provided async function,
 * categorizing results into successes and failures.
 *
 * @template T - The shape of the data being processed.
 * @param items - The input array, where each item must have a unique `id`.
 * @param operation - An async function that processes a single item.
 * @returns An object containing `successes` and `failures` arrays,
 *          each with metadata and result or error.
 */
export async function processBulk<I extends { id: string }, T = unknown, E = Error>(
  items: Array<I>,
  operation: (item: I) => Promise<T>,
): Promise<{
  successes: Array<BulkResult<T, E>>;
  failures: Array<BulkResult<T, E>>;
}> {
  const results = await Promise.all(
    items.map(async (item): Promise<BulkResult<T, E>> => {
      try {
        const data = await operation(item);
        return { id: item.id, success: true, data };
      } catch (error) {
        return { id: item.id, success: false, error: error as E };
      }
    }),
  );

  const successes = results.filter((res) => res.success);
  const failures = results.filter((res) => !res.success);

  return { successes, failures };
}
