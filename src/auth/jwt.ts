export interface TokenInfo {
  timeUntilExpiry: {
    inSeconds: number;
    inMinutes: number;
  };
  user: {
    id: string | undefined;
    username: string | undefined;
    database: string | undefined;
    application: string | undefined;
  };
}

/**
 * @param token - The JWT token string to extract information from.
 * @returns An object containing the time until expiry and user information.
 * @throws Will throw an error if the token is invalid or cannot be decoded.
 */
export function extractInfoFromToken(token: string): TokenInfo {
  const decoded = decodeJWT(token);

  const expirationDate = decoded.exp;
  const currentTime = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = expirationDate - currentTime;
  const minutesUntilExpiry = Math.floor(secondsUntilExpiry / 60);

  return {
    timeUntilExpiry: {
      inSeconds: secondsUntilExpiry,
      inMinutes: minutesUntilExpiry,
    },
    user: {
      id: decoded.sub || undefined,
      username: decoded.username || undefined,
      database: decoded.database || undefined,
      application: decoded.application || undefined,
    },
  };
}

/**
 * Decodes a JWT token string to extract its payload.
 * @param token - The JWT token string.
 * @returns The decoded payload as an object.
 */
export function decodeJWT(token: string) {
  // Split the JWT into its three parts
  const [, payload] = token.split(".");

  // Decode the payload
  const decodedPayload = base64UrlDecode(payload);

  // Parse the JSON string
  return JSON.parse(decodedPayload);
}

/**
 * Decodes a base64 URL-encoded string.
 * @param base64Url - The base64 URL-encoded string to decode.
 * @returns The decoded string.
 */
export function base64UrlDecode(base64Url: string): string {
  // Replace non-url-safe chars with base64 standard chars
  const base64Safe = base64Url.replaceAll("-", "+").replaceAll("_", "/");

  // Pad out with standard base64 required padding characters
  const pad = base64Safe.length % 4 === 0 ? "" : "=".repeat(4 - (base64Safe.length % 4));
  const base64 = base64Safe + pad;

  // Decode base64 string
  return atob(base64);
}
