<script setup lang="ts">
defineProps(["project"]);
</script>
<template>
  <img
    v-if="project.logo"
    class="h-20 aspect-[3/2] object-contain p-3 bg-white/90"
    :src="project.logo"
    :alt="`Logo of ${project.name}`"
  />
  <div
    v-else
    class="h-20 aspect-[3/2] bg-white text-black uppercase border border-tertiary-light dark:border-tertiary-dark items-center justify-center flex font-sans font-black"
  >
    <span>{{ project.name.slice(0, 20) }}...</span>
  </div>
</template>
