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
    class="w-14 h-14 aspect-square object-contain outline"
    v-if="maintainer.photo"
    :src="maintainer.photo"
  />
  <img
    v-else
    class="w-14 h-14 aspect-square"
    :src="getMaintainerPlaceholderImage()"
  />
</template>
