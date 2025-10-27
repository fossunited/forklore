<script setup lang="ts">
import { useRouter } from "vue-router";
import type { MaintainersCollectionItem } from "@nuxt/content";

const props = defineProps<{
  modelValue: string;
  maintainers?: MaintainersCollectionItem[];
  placeholder?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();

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
<div class="flex flex-col sm:flex-row sm:items-center gap-2">
  <!-- Search input -->
  <div class="flex items-center px-4 py-2 gap-4 border transition-all w-full sm:w-[350px]">
    <IconsSearch class="w-4 h-4" />
    <input
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholder || 'Search'"
      class="input w-full dark:placeholder:text-secondary-dark placeholder:text-secondary-light text-sm focus:outline-none"
    />
    <span class="text-xs border rounded px-2 hidden md:inline-block opacity-50">
      ctrl+k
    </span>
  </div>

  <!-- Buttons -->
  <div class="flex gap-2 sm:ml-auto text-sm">
    <button
      @click="goToRandomMaintainer"
      class="flex gap-2 items-center btn-subtle"
    >
      Surprise Me
    </button>

    <NuxtLink
      to="/commit-emoji"
      class="flex gap-2 items-center btn-subtle"
    >
      Commit to Emoji
    </NuxtLink>
  </div>
</div>

</template>
