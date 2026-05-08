<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ project: { logo?: string; name: string; project_link?: string } }>();

function shortLabel(project: { name: string; project_link?: string }) {
  if (project.project_link) {
    try {
      const parts = new URL(project.project_link).pathname.replace(/\/$/, "").split("/").filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    } catch {}
  }
  return project.name;
}

const label = computed(() => shortLabel(props.project));

const textSize = computed(() => {
  const len = label.value.length;
  if (len <= 8) return "text-base";
  if (len <= 14) return "text-sm";
  if (len <= 22) return "text-xs";
  return "text-[9px]";
});

</script>

<template>
  <img
    v-if="project.logo"
    class="h-20 aspect-[3/2] object-contain p-3 bg-white/96"
    :src="project.logo"
    :alt="`Logo of ${project.name}`"
  />
  <div
    v-else
    class="h-20 aspect-[3/2] flex items-center justify-center p-2 bg-tertiary-light dark:bg-tertiary-dark text-secondary-light dark:text-secondary-dark"
  >
    <span :class="[textSize, 'font-bold text-center leading-tight break-words w-full']">
      {{ label }}
    </span>
  </div>
</template>
