<template>
  <div class="p-8 space-y-6">
    <h1 class="text-2xl font-bold">Commit to Emoji</h1>
    <div class="grid grid-cols-4 gap-6">
      <div
        v-for="(emoji, index) in emojiResponses"
        :key="index"
          class="
		  flex items-center justify-center
		  h-28 dark:bg-gray-100/5 bg-gray-200/50 rounded text-6xl hover:scale-110 hover:bg-gray-900/50 dark:hover:bg-[#cff2da]/80
		  transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        role="button"
        tabindex="0"
        @click="$router.push(emojiMaintainers[index].path)"
        @keydown.enter="$router.push(emojiMaintainers[index].path)"
        @keydown.space.prevent="$router.push(emojiMaintainers[index].path)"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { MaintainersCollectionItem } from "@nuxt/content";

const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});

const emojiResponses = ref<string[]>([]);
const emojiMaintainers = ref<MaintainersCollectionItem[]>([]);

onMounted(() => {
  if (!maintainers.value) return;

  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

  maintainers.value.forEach((maintainer: MaintainersCollectionItem) => {
    const form = maintainer.body?.form || [];

    const emojiAnswer = form.find((entry: any) =>
      entry.question?.includes("one emoji"),
    );

    if (emojiAnswer?.response) {
      const segments = Array.from(segmenter.segment(emojiAnswer.response));
      const firstEmoji = segments[0]?.segment;

      if (firstEmoji) {
        emojiResponses.value.push(firstEmoji);
        emojiMaintainers.value.push(maintainer);
      }
    }
  });
});
</script>
