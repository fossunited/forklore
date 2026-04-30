<script setup lang="ts">
import Link from "./ui/Link.vue";

defineProps(["project"]);
</script>

<template>
  <div class="p-8 flex flex-col gap-6 items-start min-w-0 w-full">
    <ProjectLogo :project="project" />
    <h2 class="text-xl font-bold">{{ project.name }}</h2>
    <MDC
      :value="project.description"
      class="prose dark:prose-invert text-base sans-text break-words"
    />
    <Link
      v-if="project.project_link"
      :link="project.project_link"
      variant="solid"
    />
    <Link
      v-if="project.website_link"
      :link="project.website_link"
      variant="outline"
      pre-icon="web"
    />
  </div>
</template>
