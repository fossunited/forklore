<script setup lang="ts">
defineProps(["maintainer"]);
</script>
<template>
  <div class="flex flex-col p-8 gap-12">
    <template v-for="item in maintainer.form" :key="item.question">
      <div
        class="flex flex-col gap-6 text-base font-normal sans-text"
        v-if="item.response"
      >
        <div class="bg-secondary-light dark:bg-secondary-dark p-2">
          <p class="text-primary-light dark:text-primary-dark">
            {{ item.question }}
          </p>
        </div>

        <MDC
          :value="item.response"
          class="content prose dark:prose-invert whitespace-pre-wrap text-secondary-light dark:text-secondary-dark break-words"
        />
      </div>
    </template>
  </div>
</template>
