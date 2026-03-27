<script setup lang="ts">
import RSS from "~/components/icons/RSS.vue";
definePageMeta({ keepalive: true });

const route = useRoute();
const username = route.params.username as string;

const { data: maintainer } = await useAsyncData(
  `maintainer-planet-${username}`,
  () => queryCollection("maintainers").path(`/maintainers/${username}`).first(),
);

const displayName = maintainer.value?.full_name || username;

useHead({ title: `${displayName} · Planet | Forklore` });
useSeoMeta({
  title: `${displayName} · Planet | Forklore`,
  description: `Blog posts by ${displayName} on Forklore Planet`,
});
if (maintainer.value) {
  defineOgImage("Maintainer", { maintainer: maintainer.value });
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Maintainer header -->
    <div class="flex flex-col gap-4 p-8 border-custom-b bg-tertiary-light dark:bg-tertiary-dark">
      <nuxt-link to="/planet" class="text-xs opacity-60 hover:opacity-100 hover:underline">
        ← All Posts
      </nuxt-link>

      <div class="flex items-center gap-4">
        <MaintainerImage :maintainer="maintainer" />
        <div class="flex flex-col gap-1">
          <nuxt-link :to="`/maintainers/${username}`" class="text-xl font-bold hover:underline">
            {{ maintainer.full_name }}
          </nuxt-link>
          <p class="text-sm opacity-60">{{ maintainer.designation }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <nuxt-link :to="`/maintainers/${username}`" class="btn-outline text-xs px-3 py-1">
          View Profile →
        </nuxt-link>
        <a
          v-if="maintainer.socials?.find(s => s.label === 'RSS')"
          :href="maintainer.socials.find(s => s.label === 'RSS').link"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-subtle text-xs px-3 py-1"
        ><RSS /></a>
      </div>
    </div>

    <PlanetList :username="username" />
  </div>
</template>
