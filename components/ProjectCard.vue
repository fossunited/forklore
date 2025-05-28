<script setup lang="ts">
import { IconsArrowUpRight } from "#components";
defineProps(["project"]);
</script>
<template>
  <div class="p-8 flex flex-col gap-4">
    <div class="flex gap-5 items-start">
      <img
        v-if="project.logo"
        class="h-20 aspect-[3/2] object-contain p-3 bg-white"
        :src="project.logo"
        alt="Project Logo"
      />
      <div
        v-else
        class="h-20 aspect-[3/2] bg-white text-black uppercase items-center justify-center flex font-sans font-black"
      >
        <span>{{ project.name }}</span>
      </div>
      <div class="flex flex-col gap-3">
        <h5 class="font-semibold">{{ project.name }}</h5>
        <a
          class="btn-secondary text-sm"
          :href="project.link"
          target="_blank"
          @click.stop
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
