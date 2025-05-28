<script setup lang="ts">
defineProps(["maintainer"]);
</script>
<template>
  <div class="flex flex-col p-8 gap-12">
    <div
      class="flex flex-col gap-6 text-base font-normal"
      v-for="item in maintainer.form"
      :key="item.question"
    >
      <div class="bg-secondary-light dark:bg-secondary-dark p-2">
        <p class="text-primary-light dark:text-primary-dark">
          {{ item.question }}
        </p>
      </div>
      <div>
        <p class="text-secondary-light dark:text-secondary-dark">
          {{ item.response }}
        </p>
      </div>
    </div>
  </div>
</template>
