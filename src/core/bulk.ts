/**
 * Represents an input item for a bulk operation, which must include a unique identifier.
 */
type BulkInput = unknown & { id: string };

/**
 * The result of an individual bulk operation.
 */
type BulkResult<T> = {
  id: string;
  success: boolean;
  data?: T;
  error?: unknown;
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
export async function processBulk<T>(
  items: Array<BulkInput>,
  operation: (item: BulkInput) => Promise<T>,
): Promise<{
  successes: Array<BulkResult<T>>;
  failures: Array<BulkResult<T>>;
}> {
  const results = await Promise.all(
    items.map(async (item): Promise<BulkResult<T>> => {
      try {
        const data = await operation(item);
        return { id: item.id, success: true, data };
      } catch (error) {
        return { id: item.id, success: false, error };
      }
    }),
  );

  const successes = results.filter((res) => res.success);
  const failures = results.filter((res) => !res.success);

  return { successes, failures };
}
