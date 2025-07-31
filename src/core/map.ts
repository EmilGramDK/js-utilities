/**
 * Converts an array of objects into a Map using a specified key.
 * @param items - The array of objects to convert.
 * @param key - The key to use for the Map.
 * @returns A Map where the keys are the values of the specified key in the objects, and the values are the objects themselves.
 */
export function convertToMap<T, K extends keyof T>(items: Array<T>, key: K): Map<T[K], T> {
  const map = new Map<T[K], T>();
  for (const item of items) {
    map.set(item[key], item);
  }
  return map;
}
