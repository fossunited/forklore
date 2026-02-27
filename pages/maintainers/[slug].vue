<script setup lang="ts">
import MaintainerPageLayout from "@/layout/MaintainerPageLayout.vue";
const route = useRoute();

const { data: maintainer, status: maintainerStatus } = await useAsyncData(
  route.path,
  () => {
    return queryCollection("maintainers").path(route.path).first();
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
        <MaintainerFormRender :maintainer="maintainer" />
      </div>
    </template>
  </MaintainerPageLayout>
</template>
