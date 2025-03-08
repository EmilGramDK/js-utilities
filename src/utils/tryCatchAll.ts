/**
 * A function that wraps an array of promises in try-catch blocks.
 * @param promises An array of promises to wrap.
 * @returns A promise that resolves to an array of Result objects.
 *
 * @example
 * const results = await tryCatchAll([
 *   fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json()),
 *   fetch('https://jsonplaceholder.typicode.com/todos/2').then(res => res.json())
 * ]);
 *
 * results.forEach(({ data, error }, index) => {
 *   if (error) {
 *     console.error(`Error in promise ${index}:`, error);
 *   } else {
 *     console.log(`Data from promise ${index}:`, data);
 *   }
 * });
 */
export async function tryCatchAll<T, E = Error>(promises: Promise<T>[]): Promise<Result<T, E>[]> {
  return Promise.all(
    promises.map((promise) =>
      promise.then((data) => ({ data, error: null })).catch((error) => ({ data: null, error: error as E }))
    )
  );
}

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;
