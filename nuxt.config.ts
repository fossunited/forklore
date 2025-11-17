import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/color-mode"],
  css: ["/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  colorMode: {
    preference: "system",
    fallback: "dark",
    storage: "cookie",
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
  experimental: {
    extractAsyncDataHandlers: true,
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/rss"],
    },
  },
});
