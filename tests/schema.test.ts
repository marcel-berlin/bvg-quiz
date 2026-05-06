import { describe, it, expect } from "vitest";
import { z } from "astro/zod";

const lineSchema = z.object({
  slug: z.enum(["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9"]),
  shortName: z.string().min(1),
});

describe("lines schema gate (D-14 demo)", () => {
  it("rejects an entry missing shortName with a clear error at path ['shortName']", () => {
    const broken = { slug: "u3" }; // shortName intentionally missing
    const result = lineSchema.safeParse(broken);

    expect(result.success).toBe(false);
    if (result.success) return; // type narrowing for TS
    // Zod 4: errors live in `result.error.issues`, NOT `result.error.errors` (Zod 3)
    const issue = result.error.issues[0];
    expect(issue.path).toEqual(["shortName"]);
    expect(issue.code).toBe("invalid_type");
    // Zod 4 issue shape includes `expected` and `received`
    expect(issue.message).toMatch(/required|expected/i);
  });

  it("rejects an invalid slug with an issue at path ['slug']", () => {
    const broken = { slug: "u99", shortName: "U99" };
    const result = lineSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].path).toEqual(["slug"]);
  });
});
