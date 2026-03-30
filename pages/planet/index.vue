<script setup lang="ts">
definePageMeta({ keepalive: true });

const { data: stats } = await useAsyncData("planet-stats", async () => {
  const docs = await queryCollection("planet").all();
  return {
    authors: docs.length,
    posts: docs.reduce((n, d) => n + (d.posts?.length || 0), 0),
  };
});

useHead({ title: "Planet | Forklore" });
useSeoMeta({
  title: "Planet | Forklore",
  ogTitle: "Planet | Forklore",
  description: "Aggregated blog posts from India's open source maintainers",
  ogDescription: "Aggregated blog posts from India's open source maintainers",
});
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-4 p-4 md:p-8 border-custom-b bg-tertiary-light dark:bg-tertiary-dark">
      <h1 class="text-2xl md:text-4xl font-bold">Planet Forklore</h1>
      <p class="text-sm">Aggregated blog posts from India's open source maintainers.</p>
      <div v-if="stats" class="flex gap-4 text-xs opacity-60">
        <span>{{ stats.authors }} maintainers</span>
        <span>·</span>
        <span>{{ stats.posts }} posts</span>
      </div>
      <a href="/planet/rss" target="_blank" class="btn-solid text-sm font-bold self-start">
        Subscribe to RSS
      </a>
    </div>
    <PlanetList />
  </div>
</template>
