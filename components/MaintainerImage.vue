<script setup lang="ts">
const colorMode = useColorMode();

const props = defineProps<{
  maintainer: { photo?: string; full_name: string };
  size?: string;
}>();

const sizeClass = computed(() => props.size || "w-14 h-14");

const getMaintainerPlaceholderImage = () => {
  if (colorMode.value === "dark") {
    return "/maintainer_photo_dark.svg";
  } else if (colorMode.value === "light") {
    return "/maintainer_photo_light.svg";
  }
};
</script>

<template>
  <ClientOnly>
    <img
      :class="[sizeClass, 'aspect-square object-contain outline']"
      loading="lazy"
      v-if="maintainer.photo"
      :src="maintainer.photo"
      :alt="`Photo of ${maintainer.full_name}`"
    />
    <img
      v-else
      :class="[sizeClass, 'aspect-square']"
      :src="getMaintainerPlaceholderImage()"
      alt="Placeholder image for maintainer"
    />
  </ClientOnly>
</template>
