import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/color-mode"],
  css: ["/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss(), require("@tailwindcss/typography")],
  },
  colorMode: {
    storage: "cookie",
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 2,
        },
        highlight: {
          theme: 'one-dark-pro',
        },
      },
    },
  },
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",

      htmlAttrs: {
        lang: "en",
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.svg" },
        {
          rel: "alternate",
          type: "application/rss+xml",
          href: "/rss",
          title: "Forklore RSS Feed",
        },
      ],
    },
  },
  compatibilityDate: "2025-05-15",
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/rss"],
    },
  },
});
