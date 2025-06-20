<script setup lang="ts">
defineProps(["maintainer"]);
</script>
<template>
  <div class="flex flex-col border outline-0">
    <div class="p-8 flex gap-4 items-center bg-tertiary-light dark:bg-tertiary-dark">
      <MaintainerImage :maintainer="maintainer" />
      <div class="flex flex-col grow">
        <h4 class="font-bold">{{ maintainer.full_name }}</h4>
        <p class="text-sm">
          {{ maintainer.designation }}
        </p>
      </div>
      <a
        class="btn-solid text-sm"
        :href="maintainer.path"
      >
        <span>Profile</span>
      </a>
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
