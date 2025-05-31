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
  <div class="px-8 pt-40 pb-8 border-custom-b space-y-6">
    <img :src="getLogoPath()" alt="forklore logo" class="h-10" />
    <p>
      by <a href="https://fossunited.org" class="font-bold link">FOSS United</a>
    </p>
  </div>
  <div class="px-8 py-12 border-custom-b">
    <p class="font-semibold">
      Like a slambook, but with fewer crushes and more commits
    </p>
    <br />
    <p>
      Forklore brings you confessions, quirks, and the occasional rant from
      India's open source keepers.
    </p>
  </div>
</template>
