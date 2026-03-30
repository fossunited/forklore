<script setup lang="ts">
import { computed } from "vue";
const colorMode = useColorMode();

const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});

const maintainerCount = computed(() => {
  return maintainers.value?.length || 0;
});

const getLogoPath = computed(() => {
  if (colorMode.value === "dark") {
    return "/logo/logo_light.svg";
  } else if (colorMode.value === "light") {
    return "/logo/logo_dark.svg";
  }
});
</script>

<template>
  <div class="px-8 pt-10 md:pt-30 pb-8 border-custom-b space-y-6">
    <div class="flex items-center gap-4">
      <img :src="getLogoPath" alt="forklore logo" class="h-10" />
    </div>
    <div class="flex flex-col sm:flex-row justify-between">
      <p>
        by
        <a href="https://fossunited.org" class="font-bold link">FOSS United</a>
      </p>

      <span class="text-md font-bold" v-if="maintainerCount > 0">
        {{ maintainerCount }}
        {{ maintainerCount === 1 ? "maintainer" : "maintainers" }}
      </span>
    </div>
  </div>
  <div class="px-4 md:px-8 py-12 border-custom-b">
    <p class="font-semibold">
      Like a slam book, but with fewer crushes and more commits
    </p>
    <br />
    <p>
      Forklore brings you confessions, quirks, and the occasional rant from
      India's open source keepers.
    </p>
    <br />
    <nuxt-link to="/planet" class="btn-outline text-sm font-bold">
      Read Planet →
    </nuxt-link>
  </div>
</template>
