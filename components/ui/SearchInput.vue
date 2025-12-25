<script setup lang="ts">
import { useRouter } from "vue-router";
import type { MaintainersCollectionItem } from "@nuxt/content";

const props = defineProps<{
  maintainers?: MaintainersCollectionItem[];
  placeholder?: string;
}>();

const router = useRouter();
const query = defineModel<string>();
const sortBy = defineModel<string>("sortBy"); // new
const inputRef = ref<HTMLInputElement | null>(null);
const isMac = ref(false);

onMounted(() => {
  isMac.value = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
});

defineExpose({ focus: () => inputRef.value?.focus?.() });

const goToRandomMaintainer = () => {
  const list = props.maintainers || [];
  if (list.length === 0) return;

  const randomIndex = Math.floor(Math.random() * list.length);
  const randomMaintainer = list[randomIndex];

  if (randomMaintainer.path) {
    router.push(randomMaintainer.path);
  } else {
    console.warn("Missing path in random maintainer", randomMaintainer);
  }
};
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
  >
    <div class="flex flex-row gap-2 text-sm">
      <div
        class="flex items-center px-4 py-2 gap-4 border w-full sm:w-[300px] transition-all rounded-md"
      >
        <IconsSearch class="w-4 h-4" />

        <input
          ref="inputRef"
          v-model="query"
          type="text"
          :placeholder="placeholder || 'Search'"
          class="input w-full dark:placeholder:text-secondary-dark placeholder:text-secondary-light text-sm focus:outline-none"
        />

        <span
          class="text-xs border rounded px-2 hidden md:inline-block whitespace-nowrap opacity-80"
        >
          {{ isMac ? '⌘+k' : 'ctrl+k' }}
        </span>
      </div>

      <select
        v-model="sortBy"
        class="appearance-none border cursor-pointer p-2 items-center rounded-md bg-primary-light dark:bg-primary-dark text-secondary-light dark:text-secondary-dark transition-colors duration-300 ease-linear"
      >
        <option value="a-z">A → Z</option>
        <option value="z-a">Z → A</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>

    <div class="flex gap-2 text-sm sm:ml-4">
      <button
        v-if="maintainers && maintainers.length > 0"
        @click="goToRandomMaintainer"
        class="btn-subtle flex gap-2 items-center"
      >
        Surprise Me
      </button>

      <NuxtLink to="/commit-emoji" class="btn-subtle flex gap-2 items-center">
        Commit to Emoji
      </NuxtLink>
    </div>
  </div>
</template>
