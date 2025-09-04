<script setup lang="ts">
import type { MaintainersCollectionItem } from "@nuxt/content";
import MiniSearch from "minisearch";

const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});

const normalizedMaintainers = computed(() =>
  maintainers.value?.map((m) => ({
    ...m,
    projects_list: m.projects.map((p) => p.name).join(", "),
  })),
);

const query = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);

const miniSearch = new MiniSearch({
  fields: ["username", "full_name", "projects_list"],
  storeFields: ["username", "full_name", "projects_list"],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
  },
});

if (normalizedMaintainers.value) {
  miniSearch.addAll(normalizedMaintainers.value);
}

const result = computed(() => {
  const q = toValue(query).trim();
  if (!q) return maintainers.value || [];
  return miniSearch
    .search(q)
    .map((hit) => maintainers.value!.find((m) => m.id === hit.id))
    .filter((m): m is MaintainersCollectionItem => m !== undefined);
});

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key == "k") {
      e.preventDefault();
      searchInputRef.value?.focus();
    }
  });
});
</script>

<template>
  <div class="flex flex-col gap-8 px-8 py-10">
    <UiSearchInput
      v-if="maintainers"
      v-model="query"
      :maintainers="maintainers"
      ref="searchInputRef"
      class="max-w-100"
      placeholder="Search"
    />

    <MaintainerCard
      v-for="maintainer in result"
      :key="maintainer.id"
      :maintainer="maintainer"
    />
    <div v-if="!result.length" class="flex flex-col items-center gap-2 mt-12">
      <span>¯\_(ツ)_/¯</span>
      <h5 class="text-base uppercase">No Maintainers Found</h5>
    </div>
  </div>
</template>
