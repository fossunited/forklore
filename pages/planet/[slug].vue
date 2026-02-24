<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

interface StoredPost {
  id: string;
  slug: string;
  title: string;
  link: string;
  pubDate: string;
  author: string;
  content: string;
  contentSnippet: string;
  tags: string[];
  guid: string;
  maintainerName: string;
  maintainerUsername: string;
  maintainerPath: string;
  feedUrl: string;
}

// Fetch the specific post
// Fetch the specific post
const { data: post, status } = await useFetch<StoredPost>(
  `/api/planet/post/${slug}`,
);


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(dateString);
};

useHead({
  title: `${post.value?.title || "Post"} | Forklore Planet`,
});

useSeoMeta({
  title: `${post.value?.title || "Post"} | Forklore Planet`,
  ogTitle: `${post.value?.title || "Post"} | Forklore Planet`,
  description:
    post.value?.contentSnippet || "Read this post on Forklore Planet",
  ogDescription:
    post.value?.contentSnippet || "Read this post on Forklore Planet",
});
</script>

<template>
  <div v-if="status === 'pending'" class="flex justify-center py-12">
    <NuxtLoadingIndicator />
  </div>

  <div
    v-else-if="post"
    class="flex flex-col gap-8 px-8 py-10 max-w-4xl mx-auto"
  >
    <!-- Post Header -->
    <div class="flex flex-col gap-6 border-custom-b pb-8">
      <div class="flex flex-col gap-4">
        <h1 class="text-4xl font-bold">{{ post.title }}</h1>

        <div class="flex flex-wrap items-center gap-4 text-sm">
          <nuxt-link :to="post.maintainerPath" class="font-bold link">
            {{ post.maintainerName }}
          </nuxt-link>
          <span>•</span>
          <time :datetime="post.pubDate">
            {{ formatDate(post.pubDate) }}
          </time>
          <span v-if="post.author && post.author !== post.maintainerName">
            • by {{ post.author }}
          </span>
        </div>

        <!-- Tags -->
        <div
          v-if="Array.isArray(post.tags) && post.tags.length > 0"
          class="flex flex-wrap gap-2"
        >
          <nuxt-link
            v-for="tag in post.tags"
            :key="tag"
            :to="`/planet?tag=${encodeURIComponent(tag)}`"
            class="px-3 py-1 text-sm bg-secondary-light/20 dark:bg-secondary-dark/20 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition-colors"
          >
            {{ tag }}
          </nuxt-link>
        </div>

        <!-- Original Post Link -->
        <div class="flex gap-4 items-center">
          <a
            :href="post.link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm link font-bold hover:underline"
          >
            Read on original site →
          </a>
        </div>
      </div>
    </div>

    <!-- Post Content -->
<article class="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-a:underline prose-img:rounded-lg prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800">
  <div v-html="post.content" class="break-words" />
</article>

    <!-- Footer -->
    <div class="flex flex-col gap-4 pt-8 border-custom-t">
      <div class="flex justify-between items-center">
        <nuxt-link to="/planet" class="link font-bold">
          ← Back to Planet
        </nuxt-link>
        <a
          :href="post.link"
          target="_blank"
          rel="noopener noreferrer"
          class="link font-bold"
        >
          View Original →
        </a>
      </div>

      <div class="text-sm text-secondary-light/60 dark:text-secondary-dark/60">
        <p>
          This post was originally published on
          <a
            :href="post.link"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
          >
            {{ post.maintainerName }}'s blog
          </a>
          and syndicated to Forklore Planet.
        </p>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-center gap-2 mt-12 px-8 py-10">
    <span>¯\_(ツ)_/¯</span>
    <h5 class="text-base uppercase">Post Not Found</h5>
    <nuxt-link to="/planet" class="link font-bold mt-4">
      ← Back to Planet
    </nuxt-link>
  </div>
</template>
