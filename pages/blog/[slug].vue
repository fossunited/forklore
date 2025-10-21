<script lang="ts" setup>
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path(route.path).first()
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div v-if="page" class="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-6">

    <div
      class="bg-tertiary-light dark:bg-tertiary-dark border-custom p-8 flex flex-col gap-4"
    >
      <h1 class="text-3xl font-bold">{{ page.title }}</h1>

      <div class="text-base text-secondary-light dark:text-secondary-dark">
        <p>
          by <strong>{{ page.author }}</strong> •
          {{ formatDate(page.date) }}
        </p>
      </div>

      <div v-if="page.tags?.length" class="flex flex-wrap gap-2 mt-2">
        <span
          v-for="tag in page.tags"
          :key="tag"
          class="tag-card"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div v-if="page.body?.toc?.links?.length" class="toc-wrapper border-l-4 pl-4">
      <h2 class="text-lg font-bold mb-2">Table of Contents</h2>
      <ul class="space-y-1 text-sm list-disc list-inside">
        <li v-for="link in page.body.toc.links" :key="link.id">
          <a
            :href="`#${link.id}`"
            class=" hover:underline"
          >
            {{ link.text }}
          </a>

          <ul v-if="link.children" class="ml-4 list-disc">
            <li v-for="child in link.children" :key="child.id">
              <a
                :href="`#${child.id}`"
                class="hover:underline"
              >
                {{ child.text }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>


    <div class="prose dark:prose-invert sans-text max-w-none px-2">
        <ContentRenderer :value="page" :prose=true class="max-w-none" />
    </div>
  </div>


  <div v-else class="empty-page text-center py-24">
    <h1 class="text-2xl font-bold">Page Not Found</h1>
    <p class="text-gray-500 mt-2">
      Oops! The content you're looking for doesn't exist.
    </p>
    <NuxtLink to="/" class="mt-4 inline-block underline">
      Go back home
    </NuxtLink>
  </div>
</template>
