<script lang="ts" setup>
import BaseLayout from "@/layout/BaseLayout.vue";

useHead({
  title: "Forklore",
  meta: [
    { name: "description", content: "FOSS United" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

useSeoMeta({
  title: "Forklore",
  ogTitle: "Forklore",
  description:
    "Confessions, quirks and occasional rants from India’s open source keepers",
  ogDescription:
    "Confessions, quirks and occasional rants from India’s open source keepers",
  ogImage: {
    url: "https://forklore.in/og_image_main.png",
    width: 1200,
    height: 630,
    type: "image/png",
  },
  twitterCard: "summary_large_image",
});
</script>
<template>
  <BaseLayout>
    <NuxtPage> </NuxtPage>
  </BaseLayout>
</template>
