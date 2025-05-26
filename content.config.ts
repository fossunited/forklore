import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    maintainers: defineCollection({
      type: "data",
      source: "maintainers/**.json",
      schema: z.object({
        username: z.string(),
        full_name: z.string(),
        designation: z.string(),
      }),
    }),
  },
});
