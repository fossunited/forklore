<script setup lang="ts">
const query = defineModel<string>();

const inputRef = ref<HTMLInputElement | null>(null);
defineExpose({ focus: () => inputRef.value?.focus?.() });
</script>
<template>
  <div
    class="flex items-center px-4 py-2 gap-4 border has-focus:outline-1 transition-all duration-300 ease-linear"
  >
    <IconsSearch class="w-4 h-4" />
    <input
      ref="inputRef"
      v-model="query"
      type="text"
      placeholder="Search"
      class="input w-full dark:placeholder:text-secondary-dark placeholder:text-secondary-light text-sm focus:outline-none"
    />
    <span class="text-xs border rounded px-2 hidden md:inline-block opacity-50">
      ctrl+k
    </span>
  </div>
</template>
