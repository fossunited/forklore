<script setup lang="ts">
const colorMode = useColorMode();

const getLogoPath = () => {
  if (colorMode.value === "dark") {
    return "logo/logo_light.svg";
  } else if (colorMode.value === "light") {
    return "logo/logo_dark.svg";
  }

  return "logo/logo_light.svg";
};
</script>

<template>
  <div class="px-9 pt-40 pb-9 border-custom-b space-y-6">
    <img :src="getLogoPath()" alt="forklore logo" class="h-10" />
    <p>by <a href="https://fossunited.org" class="font-bold link">FOSS United</a></p>
  </div>
  <div class="px-9 py-12 border-custom-b">
    <p>
      31 days, 31 FOSS maintainers from India Chat with FOSS maintainers from
      India. Sharing experiences, opinions, stories.
    </p>
  </div>
</template>
