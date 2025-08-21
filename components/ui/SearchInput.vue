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
  <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
    <div class="flex items-center px-4 py-2 gap-4 border transition-all">
      <IconsSearch class="w-4 h-4" />
      <input
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        type="text"
        :placeholder="placeholder || 'Search'"
        class="input w-full dark:placeholder:text-secondary-dark placeholder:text-secondary-light text-sm focus:outline-none"
      />
      <span
        class="text-xs border rounded px-2 hidden md:inline-block opacity-50"
      >
        ctrl+k
      </span>
    </div>

    <button
      @click="goToRandomMaintainer"
      class="ml-2 flex text-sm gap-2 items-center btn-subtle w-fit"
    >
      Surprise Me!
    </button>
  </div>
</template>
