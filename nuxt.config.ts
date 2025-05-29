import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/color-mode"],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.svg" }],
    },
  },
  nitro: {
    prerender: {
      // 1. Don’t crawl every <a>—only prerender exactly what you list here
      crawlLinks: false,

      // 2. Only prerender your homepage (or any other “safe” routes)
      routes: ["/"],

      // 3. If there *are* errors, don’t blow up your build
      failOnError: false,

      // 4. Explicitly ignore any problematic dynamic routes
      // ignore: ["/maintainer",],
    },
  },
});
