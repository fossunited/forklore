import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  modules: [
    "@nuxt/content",
    "@nuxtjs/color-mode",
    "nuxt-og-image",
    "@nuxt/fonts",
  ],
  css: ["/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  colorMode: {
    classSuffix: "-mode",
    preference: "dark",
  },
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",

      htmlAttrs: {
        lang: "en",
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.svg" },
        {rel: "alternate", type: "application/rss+xml", href: "/rss", title: "Forklore RSS Feed",},
        {rel: "alternate", type: "application/rss+xml", href: "/planet/rss", title: "Planet Forklore Feed",},
      ],
    },
  },
  compatibilityDate: "2025-05-15",
  experimental: {
    extractAsyncDataHandlers: true,
  },
  nitro: {
    devStorage: {
      // Payload cache key starts with "cache:" prefix; /planet (file) conflicts
      // with /planet/username (needs directory). Target the exact namespace.
      "cache:nuxt:payload": { driver: "memory" },
    },
    prerender: {
      crawlLinks: true,
      routes: ["/rss", "/", "/planet", "/planet/rss"],
      failOnError: false,
      ignore: [
        // Relative URLs in post HTML content get followed by crawlLinks
        /^\/planet\/[^/]+\/[^/]*\.[^/]/,
      ],
    },
  },
  ogImage: {
    tailwindCss: "~/assets/css/main.css",
    zeroRuntime: true,
    buildCache: true,
  },
  site: {
    url: "https://forklore.in",
  },
  routeRules: {
    "/maintainers": {
      redirect: "/",
    },
  },
  fonts: {
    families: [
      { name: "Geist Mono", weights: [400, 700], global: true },
      { name: "Inter", weights: [400, 700], global: true },
    ],
  },
});
