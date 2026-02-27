<script setup lang="ts">
import type { MaintainersCollectionItem } from "@nuxt/content";
import MiniSearch from "minisearch";

const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});
if (import.meta.prerender && maintainers.value) {
  prerenderRoutes(
    maintainers.value.map(m => m.path)
  )
}

const normalizedMaintainers = computed(() =>
  maintainers.value?.map((m) => ({
    ...m,
    projects_list: m.projects.map((p) => p.name).join(", "),
  })),
);

const query = ref("");
const sortBy = ref("newest");
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
  let items = !q
    ? maintainers.value || []
    : miniSearch
        .search(q)
        .map((hit) => maintainers.value!.find((m) => m.id === hit.id))
        .filter((m): m is MaintainersCollectionItem => m !== undefined);

  // Apply sorting
  const sorted = [...items];
  if (sortBy.value === "a-z") {
    sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
  } else if (sortBy.value === "z-a") {
    sorted.sort((a, b) => b.full_name.localeCompare(a.full_name));
  } else if (sortBy.value === "newest") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_on).getTime();
      const dateB = new Date(b.created_on).getTime();
      return dateB - dateA;
    });
  } else if (sortBy.value === "oldest") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_on).getTime();
      const dateB = new Date(b.created_on).getTime();
      return dateA - dateB;
    });
  }

  return sorted;
});

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key == "k") {
      e.preventDefault();
      searchInputRef.value?.focus();
    }
    if (
      e.key === "/" &&
      !(
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
    ) {
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
      v-model:sort-by="sortBy"
      :maintainers="maintainers"
      ref="searchInputRef"
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
