<script setup lang="ts">
defineProps(["maintainer"]);
</script>
<template>
  <div class="relative flex flex-col border outline-0 hover:outline-1 focus-within:outline-1">
    <a
      :href="maintainer.path"
      class="absolute inset-0 z-0 focus:outline-none"
      :aria-label="maintainer.full_name"
    />
    <div
      class="p-4 md:p-8 flex gap-4 items-center bg-tertiary-light dark:bg-tertiary-dark"
    >
      <MaintainerImage :maintainer="maintainer" />
      <div class="flex flex-col min-w-0">
        <h4 class="font-bold">{{ maintainer.full_name }}</h4>
        <MDC :value="maintainer.designation" />
      </div>
    </div>
    <div
      class="relative z-10 grid grid-cols-1"
      :class="{
        'md:grid-cols-2 divide-x-custom': maintainer.projects.length > 1,
        'divide-y-custom': maintainer.projects.length > 2,
      }"
    >
      <ProjectCard
        v-for="project in maintainer.projects"
        :key="project.name"
        :project="project"
      />
    </div>
  </div>
</template>
