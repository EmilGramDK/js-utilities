/**
 *
 * @param url The URL to ping.
 * @param body The body of the request, typically containing data to be sent.
 * @description Sends a POST request to the specified URL with the provided body.
 * The function returns a promise that resolves to a boolean indicating whether the request was successful.
 * If the request fails, it catches the error and returns false.
 * This is useful for checking the availability of a service or endpoint.
 * @returns {Promise<boolean>} - A promise that resolves to true if the request was successful, false otherwise.
 */
export async function ping(url: string, body: Record<string, string>): Promise<boolean> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.ok)
    .catch(() => false);
}
