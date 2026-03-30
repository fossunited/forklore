<script setup lang="ts">
const props = defineProps<{
  tags: string[];
  mode?: "link" | "button"; // link → /planet?tag=..., button → emits tag-click
  max?: number;
}>();

const emit = defineEmits<{ "tag-click": [tag: string] }>();

const visible = computed(() =>
  props.max ? props.tags.slice(0, props.max) : props.tags,
);
</script>

<template>
  <div v-if="tags?.length" class="flex flex-wrap gap-1.5">
    <template v-if="mode === 'link'">
      <nuxt-link
        v-for="tag in visible"
        :key="tag"
        :to="`/planet?tag=${encodeURIComponent(tag)}`"
        class="px-2 py-0.5 text-xs bg-secondary-light/20 dark:bg-secondary-dark/20 hover:opacity-80 transition-opacity"
      >{{ tag }}</nuxt-link>
    </template>
    <template v-else>
      <button
        v-for="tag in visible"
        :key="tag"
        @click="emit('tag-click', tag)"
        class="px-2 py-0.5 text-xs bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80"
      >{{ tag }}</button>
    </template>
  </div>
</template>
