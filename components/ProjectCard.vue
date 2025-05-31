<script setup lang="ts">
import { IconsArrowUpRight } from "#components";
defineProps(["project"]);
</script>
<template>
  <div class="p-8 flex flex-col gap-4">
    <div class="flex flex-col md:flex-row gap-5 items-start">
      <ProjectLogo :project="project" />
      <div class="flex flex-col gap-3">
        <h5 class="font-semibold">{{ project.name }}</h5>
        <a
          @click.stop
          class="btn-subtle text-sm"
          :href="project.project_link"
          target="_blank"
        >
          <span>View Repository</span>
          <IconsArrowUpRight class="w-5 h-5"></IconsArrowUpRight>
        </a>
      </div>
    </div>
    <p class="text-sm">
      {{ project.short_description }}
    </p>
  </div>
</template>
