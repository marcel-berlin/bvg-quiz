import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const linesCollection = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/lines" }),
  schema: z.object({
    slug: z.enum(["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9"]),
    shortName: z.string().min(1),
  }),
});

export const collections = {
  lines: linesCollection,
};
