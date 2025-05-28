<script setup lang="ts">
import iconMapper from "~/utils/icons";
defineProps(["maintainer"]);
</script>
<template>
  <div
    class="bg-tertiary-light dark:bg-tertiary-dark border-custom-b p-8 flex flex-col gap-6"
  >
    <h2 class="text-xl font-light uppercase">Maintainer</h2>
    <div class="flex gap-4 items-start">
      <MaintainerImage :maintainer="maintainer" />
      <div class="flex flex-col gap-2">
        <h1 class="font-bold text-xl">{{ maintainer.full_name }}</h1>
        <p class="text-base">
          {{ maintainer.designation }}
        </p>
        <div class="flex gap-3 items-center">
          <a
            v-for="social in maintainer.socials"
            :key="social.label"
            :href="social.link"
            target="_blank"
          >
            <component
              class="w-5 h-5"
              :is="iconMapper(social.label)"
            ></component>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
