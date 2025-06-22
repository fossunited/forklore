<script setup lang="ts">
const query = defineModel<string>();
</script>
<template>
  <div
    class="flex items-center px-4 py-2 gap-4 border has-focus:outline-1 transition-all duration-300 ease-linear"
  >
    <IconsSearch class="w-4 h-4" />
    <input
      v-model="query"
      type="text"
      placeholder="Search"
      class="input w-full dark:placeholder:text-secondary-dark placeholder:text-secondary-light text-sm focus:outline-none"
    />
  </div>
</template>
