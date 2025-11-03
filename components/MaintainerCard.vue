<script setup lang="ts">
defineProps(["maintainer"]);
</script>
<template>
  <div
    class="flex flex-col border outline-0 hover:outline-1 hover:cursor-pointer focus:outline-1"
    tabindex="0"
    role="button"
    @click="$router.push(maintainer.path)"
    @keydown.enter="$router.push(maintainer.path)"
    @keydown.space.prevent="$router.push(maintainer.path)"
  >
    <div
      class="p-8 flex gap-4 items-center bg-tertiary-light dark:bg-tertiary-dark"
    >
      <MaintainerImage :maintainer="maintainer" />
      <div class="flex flex-col">
        <h4 class="font-bold">{{ maintainer.full_name }}</h4>
        <MDC :value="maintainer.designation" />
      </div>
    </div>
    <div
      class="grid grid-cols-1"
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
