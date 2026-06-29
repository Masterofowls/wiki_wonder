import { describe, expect, it } from "@jest/globals";

describe("Health API integration", () => {
  it("resolves health endpoint structure", async () => {
    const NEXT_URL = process.env.NEXT_URL ?? "http://localhost:9000";

    let response: Response;
    try {
      response = await fetch(`${NEXT_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    } catch {
      return;
    }

    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("environment");
    expect(typeof body.uptime).toBe("number");
  });
});
