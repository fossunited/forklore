<script setup lang="ts">
import iconMapper from "~/utils/icons";
defineProps(["maintainer"]);
</script>
<template>
  <div
    class="bg-tertiary-light dark:bg-tertiary-dark border-custom-b p-8 flex flex-col gap-6"
  >
    <h2 class="text-xl font-light uppercase sr-only">Maintainer details</h2>
    <div class="flex gap-4 items-start">
      <MaintainerImage :maintainer="maintainer" />
      <div class="flex flex-col gap-2 min-w-0">
        <h1 class="font-bold text-xl">{{ maintainer.full_name }}</h1>
        <MDC
          :value="maintainer.designation"
        />
        <nav aria-label="Social links" class="flex gap-3 items-center">
          <a
            v-for="social in maintainer.socials"
            :key="social.label"
            :href="social.link"
            target="_blank"
            :aria-label="`${social.label} (opens in new tab)`"
          >
            <component
              class="w-5 h-5"
              :is="iconMapper(social.label)"
              aria-hidden="true"
            ></component>
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>
