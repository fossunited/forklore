import { defineCollection, defineContentConfig, property } from "@nuxt/content";
import { z } from 'zod'

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
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string(),
        author: z.string(),
        description: z.optional(z.string()),
        date: z.date(),
        draft: z.optional(z.boolean()),
        tags: z.optional(z.array(z.string())),
        hero: z.object({
          image: property(z.string()).editor({ input: 'media' }),
          caption: z.optional(z.string())
        })
      })
    })
  },
});
