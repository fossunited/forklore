<script setup lang="ts">
const { data: posts } = await useAsyncData("blog", () => {
  return queryCollection("blog").order("date", "DESC").all();
});
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const router = useRouter();
</script>

<template>
  <section class="max-w-5xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Forklore Blog</h1>

    <div class="flex flex-col gap-6">
      <div
        v-for="post in posts"
        :key="post.path"
        class="flex flex-col border outline-0 hover:outline-1 focus:outline-1 cursor-pointer"
        role="button"
        tabindex="0"
        @click="router.push(post.path)"
        @keydown.enter="router.push(post.path)"
        @keydown.space.prevent="router.push(post.path)"
      >
        <div
          class="p-6 bg-tertiary-light dark:bg-tertiary-dark transition-colors duration-300"
        >
          <h2 class="font-bold text-xl mb-2">{{ post.title }}</h2>

          <div
            class="flex items-center justify-between flex-wrap gap-2 text-sm text-secondary-light dark:text-secondary-dark"
          >
            <div>
              by <strong>{{ post.author }}</strong> •
              {{ formatDate(post.date) }}
            </div>

            <div class="flex gap-2 flex-wrap mt-1 sm:mt-0">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="px-2 py-1 text-xs tag-card"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-custom-t sans-text">
          <p class="line-clamp-3">
            {{ post.description || post.excerpt || "" }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
