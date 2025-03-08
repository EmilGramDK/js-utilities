/**
 * A function that wraps a promise in a try-catch block.
 * @param promise The promise to wrap.
 * @returns A promise that resolves to a Result object.
 *
 * @example
 * const { error, data } = await tryCatch(fetch('https://jsonplaceholder.typicode.com/todos/1'));
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
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
