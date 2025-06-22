import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const maintainerSchema = z.object({
  username: z.string(),
  full_name: z.string(),
  photo: z.string(),
  designation: z.string(),
  socials: z.array(
    z.object({
      label: z.string(),
      link: z.string(),
    })
  ),
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
  form: z.array(
    z.object({
      question: z.string(),
      response: z.string(),
    })
  ),
  projects_list: z.string(),
});

export default defineContentConfig({
  collections: {
    maintainers: defineCollection({
      type: "page",
      source: "maintainers/**.json",
      schema: maintainerSchema,
    }),
  },
});
