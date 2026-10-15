// @vitest-environment node
/** The /leads page's reading of database errors, so the owner gets a step he can take. */
import { describe, expect, it } from "vitest";
import { databaseProblem, redact } from "@/lib/enquiries.functions";

describe("Database problems on /leads", () => {
  it("names the usual Neon failures", () => {
    expect(databaseProblem("NeonDbError: Your account or project has exceeded the compute time quota. Upgrade your plan to increase limits.")).toBe("paused");
    expect(databaseProblem("NeonDbError: The endpoint has been disabled. Enable it using Neon API and retry.")).toBe("paused");
    expect(databaseProblem("NeonDbError: password authentication failed for user 'neondb_owner'")).toBe("login");
    // The messages @neondatabase/serverless 1.x actually gives for a mistyped or wrongly copied address.
    expect(databaseProblem("NeonDbError: Wrong URL scheme or missing user, host or database in connection parameters")).toBe("bad-address");
    expect(databaseProblem("NeonDbError: Database connection string provided to neon() is not a valid URL (connection string: <DATABASE_URL>)")).toBe("bad-address");
    expect(databaseProblem("NeonDbError: Error connecting to database: TypeError: Failed to parse URL from https://api.0.0.1/sql")).toBe("bad-address");
    expect(databaseProblem("NeonDbError: Error connecting to database: fetch failed")).toBe("unreachable");
    expect(databaseProblem("Error: timed out after 20000 ms")).toBe("unreachable");
    expect(databaseProblem("NeonDbError: relation \"x\" does not exist")).toBe("other");
  });
  it("isn't fooled by the hidden address in a cleaned-up message", () => {
    const url = "postgresql://owner:secret@ep-x.neon.tech/neondb";
    const msg = redact(new Error(`relation "enquiries" is locked (${url})`), url);
    expect(msg).not.toContain("secret");
    expect(databaseProblem(msg)).toBe("other");
  });
});
