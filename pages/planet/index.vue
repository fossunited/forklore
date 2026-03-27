<script setup lang="ts">
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
    <div class="flex flex-col gap-4 p-8 border-custom-b bg-tertiary-light dark:bg-tertiary-dark">
      <h1 class="text-4xl font-bold">Forklore Planet</h1>
      <p class="sans-text text-sm">Aggregated blog posts from India's open source maintainers.</p>
      <a href="/planet/rss" target="_blank" class="btn-solid text-sm font-bold self-start">
        Subscribe to RSS
      </a>
    </div>
    <PlanetList />
  </div>
</template>
