<script setup lang="ts">
import MaintainerPageLayout from "@/layout/MaintainerPageLayout.vue";
const route = useRoute();
const slug = route.params.slug as string;

const { data: maintainer, status: maintainerStatus } = await useAsyncData(
  `maintainer-${slug}`,
  () => {
    return queryCollection("maintainers").path(`/maintainers/${slug}`).first();
  },
);

useHead({
  title: `${maintainer.value?.full_name} | Forklore`,
});

defineOgImage("Maintainer", {
  maintainer: maintainer.value,
});

useSeoMeta({
  title: `${maintainer.value?.full_name} | Forklore`,
  ogTitle: `${maintainer.value?.full_name} | Forklore`,
  description: `Get to know ${maintainer.value?.full_name} and their work.`,
  ogDescription: `Get to know ${maintainer.value?.full_name} and their work.`,
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div v-if="maintainerStatus == 'pending'">
    <NuxtLoadingIndicator />
  </div>
  <MaintainerPageLayout>
    <template #projects>
      <div class="flex flex-col divide-y-custom">
        <ProjectDetailSection
          v-for="project in maintainer?.projects"
          :key="project.name"
          :project="project"
        />
      </div>
    </template>
    <template #maintainer>
      <div class="flex flex-col divide-y-custom">
        <MaintainerDetailSection :maintainer="maintainer" />

        <!-- Planet & RSS links (only for maintainers with RSS feed) -->
        <div
          v-if="maintainer?.socials?.find(s => s.label === 'RSS')"
          class="flex flex-col gap-4 px-8 pb-4 bg-tertiary-light dark:bg-tertiary-dark"
        >
          <nuxt-link
            :to="`/planet/${maintainer?.username}`"
            class="btn-outline text-sm font-bold"
          >
            View posts on Planet →
          </nuxt-link>
        </div>

        <MaintainerFormRender :maintainer="maintainer" />
      </div>
    </template>
  </MaintainerPageLayout>
</template>
