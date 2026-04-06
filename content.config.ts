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
  created_on: z.string(),
});

const planetSchema = z.object({
  maintainerName: z.string(),
  maintainerUsername: z.string(),
  feedUrl: z.string().optional(),
  lastFetched: z.string().optional(),
  posts: z.array(
    z.object({
      slug: z.string(),
      guid: z.string().optional(),
      title: z.string(),
      link: z.string(),
      pubDate: z.string(),
      content: z.string(),
      contentSnippet: z.string(),
      image: z.string().optional(),
      author: z.string().optional(),
      tags: z.array(z.string()),
    })
  ),
});

export default defineContentConfig({
  collections: {
    maintainers: defineCollection({
      type: "page",
      source: "maintainers/**.json",
      schema: maintainerSchema,
    }),
    planet: defineCollection({
      type: "page",
      source: "planet/**.json",
      schema: planetSchema,
    }),
  },
});
