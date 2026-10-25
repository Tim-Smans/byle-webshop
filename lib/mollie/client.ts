import "server-only";
import createMollieClient, { type MollieClient } from "@mollie/api-client";

let client: MollieClient | undefined;

// Lazily created so a missing key only fails the code paths that need Mollie.
export function getMollieClient(): MollieClient {
  if (!client) {
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      throw new Error("MOLLIE_API_KEY is not set");
    }
    client = createMollieClient({ apiKey });
  }
  return client;
}
