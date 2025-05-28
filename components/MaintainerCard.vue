<script setup lang="ts">
const colorMode = useColorMode();
defineProps(["maintainer"]);

const getMaintainerPlaceholderImage = () => {
  if (colorMode.value === "dark") {
    return "/maintainer_photo_dark.svg";
  } else if (colorMode.value === "light") {
    return "/maintainer_photo_light.svg";
  }

  return "/maintainer_photo_dark.svg";
};
</script>
<template>
  <div
    class="flex flex-col border outline-0 hover:outline-1 hover:cursor-pointer"
    @click="$router.push(maintainer.path)"
  >
    <div
      class="p-8 flex gap-4 items-center bg-tertiary-light dark:bg-tertiary-dark"
    >
      <img
        class="w-8 h-8 aspect-square"
        v-if="maintainer.photo"
        :src="maintainer.photo"
      />
      <img
        class="w-8 h-8 aspect-square"
        v-else
        :src="getMaintainerPlaceholderImage()"
      />
      <div class="flex flex-col">
        <h4 class="font-bold">{{ maintainer.full_name }}</h4>
        <p class="text-sm">
          {{ maintainer.designation }}
        </p>
      </div>
    </div>
    <div
      class="grid grid-cols-1"
      :class="
        maintainer.projects.length > 1
          ? 'md:grid-cols-2 divide-x-custom'
          : 'md:grid-cols-1'
      "
    >
      <ProjectCard
        v-for="project in maintainer.projects"
        :key="project.name"
        :project="project"
      />
    </div>
  </div>
</template>
