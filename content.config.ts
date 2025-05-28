import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    maintainers: defineCollection({
      type: "page",
      source: "maintainers/**.json",
      schema: z.object({
        username: z.string(),
        full_name: z.string(),
        photo: z.string(),
        designation: z.string(),
        git_link: z.string(),
        projects: z.array(
          z.object({
            name: z.string(),
            project_link: z.string(),
            website_link: z.string(),
            logo: z.string(),
            description: z.string(),
            short_description: z.string(),
          })
        ),
      }),
    }),
  },
});
