<template>
  <div class="p-8 space-y-6">
    <h1 class="text-2xl font-bold">Commit to Emoji</h1>

    <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
      <div
        v-for="(group, emoji) in groupedEmojis"
        :key="emoji"
        class="relative"
      >
        <!-- Main emoji card -->
        <div
          class="flex items-center justify-center h-20 md:h-24 lg:h-28 dark:bg-gray-100/5 bg-gray-200/50 rounded text-4xl md:text-5xl lg:text-6xl hover:scale-110 hover:bg-gray-900/50 dark:hover:bg-[#cff2da]/80 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          role="button"
          tabindex="0"
          @click="handleClick(emoji, group)"
          @keydown.enter="handleClick(emoji, group)"
          @keydown.space.prevent="handleClick(emoji, group)"
        >
          {{ emoji }}

          <!-- Count badge -->
          <span
            v-if="group.length > 1"
            class="absolute top-1 right-1 md:top-2 md:right-2 bg-primary-light dark:bg-secondary-dark text-black text-[10px] md:text-xs font-bold rounded-full px-1.5 py-0.5"
          >
            {{ group.length }}
          </span>
        </div>

        <!-- Popup with repeated emojis -->
        <transition name="pop">
          <div
            v-if="activeEmoji === emoji"
            class="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50 flex space-x-2 justify-center"
          >
            <div
              v-for="(maintainer, idx) in group.slice(0, 3)"
              :key="maintainer._path"
              class="text-5xl hover:scale-125 transition-transform cursor-pointer"
              @click.stop="$router.push(maintainer.path)"
            >
              {{ emoji }}
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { MaintainersCollectionItem } from "@nuxt/content";

const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});

const emojiMaintainers = computed(() => {
  if (!maintainers.value) return [];

  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

  return maintainers.value.flatMap((maintainer) => {
    const form = maintainer.form || [];

    const emojiAnswer = form.find((entry) =>
      entry.question?.includes("one emoji"),
    );

    if (!emojiAnswer?.response) return [];

    const segments = Array.from(segmenter.segment(emojiAnswer.response));
    const firstEmoji =
      segments.find((s) => s.segment !== "[" && s.segment.trim() !== "")
        ?.segment ?? "";

    return firstEmoji ? [{ ...maintainer, emoji: firstEmoji }] : [];
  });
});

// Group maintainers by emoji
const groupedEmojis = computed(() => {
  const groups: Record<string, MaintainersCollectionItem[]> = {};
  for (const maintainer of emojiMaintainers.value) {
    if (!maintainer.emoji) continue;
    if (!groups[maintainer.emoji]) groups[maintainer.emoji] = [];
    groups[maintainer.emoji].push(maintainer);
  }
  return groups;
});

const activeEmoji = ref<string | null>(null);

const handleClick = (emoji: string, group: MaintainersCollectionItem[]) => {
  if (group.length === 1) {
    // Go directly to page if single emoji
    return navigateTo(group[0].path);
  }

  // Toggle popup for duplicates
  activeEmoji.value = activeEmoji.value === emoji ? null : emoji;
};

const navigateTo = (path: string) => {
  window.location.href = path;
};
</script>

<style scoped>
/* Smooth pop animation */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s ease-out;
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}
.pop-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}
</style>
