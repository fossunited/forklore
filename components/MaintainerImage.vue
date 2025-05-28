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
  <img
    class="w-12 h-12 aspect-square"
    v-if="maintainer.photo"
    :src="maintainer.photo"
  />
  <img
    v-else
    class="w-12 h-12 aspect-square"
    :src="getMaintainerPlaceholderImage()"
  />
</template>
