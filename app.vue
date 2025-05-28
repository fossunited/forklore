<script lang="ts" setup>
import BaseLayout from "@/layout/BaseLayout.vue";

useHead({
  title: "Forklore",
  meta: [
    { name: "description", content: "FOSS United" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>
<template>
  <BaseLayout>
    <NuxtPage> </NuxtPage>
  </BaseLayout>
</template>
