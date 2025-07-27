type Replacements = Record<string, string>;

/**
 * Recursively traverses and replaces keys in the response object.
 * @param obj The response object.
 * @param replacements An object where the key is the word to replace and the value is the replacement word.
 * @returns The modified object.
 */
export function replaceKeys<T>(object: T, replacements?: Replacements): T {
  if (!replacements) return object;

  if (Array.isArray(object)) {
    return object.map((item) => replaceKeys(item, replacements)) as T;
  }

  if (object !== null && typeof object === "object") {
    const newObject: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
      const newKey = replacements[key] || key;
      newObject[newKey] = replaceKeys(value, replacements);
    }
    return newObject as T;
  }

  return object;
}

/**
 * Replaces keys in an array of objects using the provided replacements.
 * @param arr The array of objects to process.
 * @param replacements An object where the key is the word to replace and the value is the replacement word.
 * @returns A new array with keys replaced.
 */
export function replaceKeysInArray<T>(array: Array<T>, replacements?: Replacements): Array<T> {
  return array.map((item) => replaceKeys(item, replacements));
}
