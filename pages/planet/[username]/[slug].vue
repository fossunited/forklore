<script setup lang="ts">
import RSS from "~/components/icons/RSS.vue";

const route = useRoute();
const router = useRouter();
const username = route.params.username as string;
const slug = route.params.slug as string;

const planetNav = usePlanetNav();
const isGlobal = computed(() => planetNav.value === "planet");

interface PostNav { slug: string; title: string; maintainerUsername: string }

interface StoredPost {
  slug: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  tags: string[];
  maintainerName: string;
  maintainerUsername: string;
  maintainerPath: string;
  maintainerPhoto?: string;
  feedUrl: string;
  newer: PostNav | null;
  older: PostNav | null;
}

const { data: post, status } = await useFetch<StoredPost>(
  () => `/api/planet/post/${username}/${slug}${isGlobal.value ? "?context=planet" : ""}`,
);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const postPath = (nav: PostNav) =>
  `/planet/${nav.maintainerUsername}/${nav.slug}`;

const goNewer = () => post.value?.newer && router.push(postPath(post.value.newer));
const goOlder = () => post.value?.older && router.push(postPath(post.value.older));

const onKey = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  if (e.key === "k" || e.key === "p") goNewer();
  if (e.key === "j" || e.key === "n") goOlder();
};
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));

useHead({ title: `${post.value?.title || "Post"} | Forklore Planet` });
useSeoMeta({
  title: `${post.value?.title || "Post"} | Forklore Planet`,
  ogTitle: `${post.value?.title || "Post"} | Forklore Planet`,
  description: post.value?.contentSnippet || "Read this post on Forklore Planet",
  ogDescription: post.value?.contentSnippet || "Read this post on Forklore Planet",
});
</script>

<template>
  <div v-if="status === 'pending'" class="flex justify-center py-16">
    <NuxtLoadingIndicator />
  </div>

  <div v-else-if="post" class="flex flex-col">
    <!-- Post header -->
    <div class="flex flex-col gap-4 p-8 bg-tertiary-light dark:bg-tertiary-dark border-custom-b">
      <nuxt-link
        :to="isGlobal ? '/planet' : `/planet/${post.maintainerUsername}`"
        class="text-xs opacity-60 hover:opacity-100 hover:underline"
      >
        ← {{ isGlobal ? "All Posts" : `${post.maintainerName}'s posts` }}
      </nuxt-link>

      <h1 class="text-3xl font-bold">{{ post.title }}</h1>

      <!-- Maintainer + date -->
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <nuxt-link
          :to="`/maintainers/${post.maintainerUsername}`"
          class="flex items-center gap-2 font-bold hover:underline"
        >
          <img
            v-if="post.maintainerPhoto"
            :src="post.maintainerPhoto"
            :alt="`Photo of ${post.maintainerName}`"
            class="w-8 h-8 aspect-square object-contain outline"
          />
          {{ post.maintainerName }}
        </nuxt-link>
        <span class="opacity-40">·</span>
        <time :datetime="post.pubDate" class="opacity-60">{{ formatDate(post.pubDate) }}</time>
        <span v-if="post.feedUrl" class="opacity-40">·</span>
        <a
          v-if="post.feedUrl"
          :href="post.feedUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs opacity-60 hover:opacity-100 hover:underline"
        ><RSS /></a>
      </div>

      <!-- Tags -->
      <div v-if="Array.isArray(post.tags) && post.tags.length" class="flex flex-wrap gap-2">
        <nuxt-link
          v-for="tag in post.tags"
          :key="tag"
          :to="`/planet?tag=${encodeURIComponent(tag)}`"
          class="px-2 py-0.5 text-xs bg-secondary-light/20 dark:bg-secondary-dark/20 hover:opacity-80 transition-opacity"
        >
          {{ tag }}
        </nuxt-link>
      </div>
    </div>

    <!-- Content -->
    <article class="prose dark:prose-invert max-w-none p-8">
      <div v-html="post.content" class="break-words" />
    </article>

    <!-- Footer: prev/next + original link -->
    <div class="flex flex-col gap-4 p-8 border-custom-t">
      <div class="grid grid-cols-2 gap-4">
        <nuxt-link
          v-if="post.newer"
          :to="postPath(post.newer)"
          class="flex flex-col gap-1 p-4 bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80 transition-opacity"
        >
          <span class="text-xs opacity-60">← Newer</span>
          <span class="text-sm font-bold line-clamp-2">{{ post.newer.title }}</span>
        </nuxt-link>
        <div v-else />

        <nuxt-link
          v-if="post.older"
          :to="postPath(post.older)"
          class="flex flex-col gap-1 p-4 bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80 transition-opacity text-right"
        >
          <span class="text-xs opacity-60">Older →</span>
          <span class="text-sm font-bold line-clamp-2">{{ post.older.title }}</span>
        </nuxt-link>
        <div v-else />
      </div>

      <p class="text-xs opacity-50 sans-text">
        Originally published on
        <a :href="post.link" target="_blank" rel="noopener noreferrer" class="hover:underline">
          {{ post.maintainerName }}'s blog ↗
        </a>
      </p>
    </div>
  </div>

  <div v-else class="flex flex-col items-center gap-2 p-16">
    <h5 class="font-bold uppercase text-sm">Post Not Found</h5>
    <nuxt-link :to="`/planet/${username}`" class="font-bold hover:underline mt-4 text-sm">
      ← Back to {{ username }}'s posts
    </nuxt-link>
  </div>
</template>
