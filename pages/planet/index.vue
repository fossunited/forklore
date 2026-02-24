<script setup lang="ts">
interface StoredPost {
  id: string;
  slug: string;
  title: string;
  link: string;
  pubDate: string;
  author: string;
  content: string;
  contentSnippet: string;
  maintainerName: string;
  maintainerUsername: string;
  maintainerPath: string;
  feedUrl: string;
  tags: string[];
  guid: string;
  fetchedAt: string;
}

interface PlanetData {
  posts: StoredPost[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  authors: Array<{ username: string; name: string; path: string }>;
  tags: Array<{ name: string; count: number }>;
}

const route = useRoute();
const router = useRouter();

// Get query params
const currentPage = computed(() => parseInt(route.query.page as string) || 1);
const selectedAuthor = computed(() => route.query.author as string | undefined);
const selectedTag = computed(() => route.query.tag as string | undefined);
const searchQuery = computed(() => route.query.search as string | undefined);

// Build query string for API
const apiQuery = computed(() => {
  const params = new URLSearchParams();
  params.set('page', currentPage.value.toString());
  if (selectedAuthor.value) params.set('author', selectedAuthor.value);
  if (selectedTag.value) params.set('tag', selectedTag.value);
  if (searchQuery.value) params.set('search', searchQuery.value);
  return params.toString();
});

const { data: planetData, status, error } = await useFetch<PlanetData>(
  () => `/api/planet/posts?${apiQuery.value}`,
  { watch: [apiQuery] }
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(dateString);
};

const truncateText = (text: string, maxLength: number = 250) => {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, '');
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
};

const updateFilter = (key: string, value: string | undefined) => {
  const query: Record<string, any> = { ...route.query };
  if (value) {
    query[key] = value;
  } else {
    delete query[key];
  }
  delete query.page; // Reset to page 1 when filtering
  router.push({ query });
};

const clearFilters = () => {
  router.push({ query: {} });
};

const goToPage = (page: number) => {
  router.push({ query: { ...route.query, page: page.toString() } });
};

const searchInput = ref(searchQuery.value || '');
const searchDebounce = ref<NodeJS.Timeout | null>(null);

watch(searchInput, (newValue) => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value);
  }
  searchDebounce.value = setTimeout(() => {
    updateFilter('search', newValue || undefined);
  }, 500);
});

useHead({
  title: 'Planet | Forklore',
});

useSeoMeta({
  title: 'Planet | Forklore',
  ogTitle: 'Planet | Forklore',
  description: 'Aggregated blog posts from India\'s open source maintainers',
  ogDescription: 'Aggregated blog posts from India\'s open source maintainers',
});
</script>

<template>
  <div class="flex flex-col gap-8 px-8 py-10">
    <!-- Header -->
    <div class="flex flex-col gap-6 border-custom-b pb-8">
      <div class="flex flex-col gap-4">
        <h1 class="text-4xl font-bold">Forklore Planet</h1>
        <p class="sans-text text-lg">
          Aggregated blog posts from India's open source maintainers. Subscribe to get all their latest posts in one feed.
        </p>
        <div class="flex flex-wrap gap-4 items-center">
          <a 
            href="/planet/rss" 
            target="_blank"
            class="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white font-bold hover:opacity-80 transition-opacity"
          >
            Subscribe to RSS Feed
          </a>
          <span v-if="planetData" class="text-sm text-secondary-light/60 dark:text-secondary-dark/60">
            {{ planetData.totalPosts }} posts
          </span>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div v-if="planetData" class="flex flex-col gap-4 border-custom-b pb-6">
      <!-- Search -->
      <div class="flex gap-2">
        <input 
          v-model="searchInput"
          type="text"
          placeholder="Search posts..."
          class="flex-1 px-4 py-2 border border-secondary-light/20 dark:border-secondary-dark/20 bg-transparent focus:outline-none focus:border-primary-light dark:focus:border-primary-dark"
        />
      </div>

      <!-- Active Filters -->
      <div v-if="selectedAuthor || selectedTag" class="flex flex-wrap gap-2 items-center">
        <span class="text-sm font-bold">Filters:</span>
        <button
          v-if="selectedAuthor"
          @click="updateFilter('author', undefined)"
          class="px-3 py-1 text-sm bg-primary-light/20 dark:bg-primary-dark/20 hover:bg-primary-light/30 dark:hover:bg-primary-dark/30 transition-colors"
        >
          Author: {{ selectedAuthor }} ✕
        </button>
        <button
          v-if="selectedTag"
          @click="updateFilter('tag', undefined)"
          class="px-3 py-1 text-sm bg-primary-light/20 dark:bg-primary-dark/20 hover:bg-primary-light/30 dark:hover:bg-primary-dark/30 transition-colors"
        >
          Tag: {{ selectedTag }} ✕
        </button>
        <button
          @click="clearFilters"
          class="px-3 py-1 text-sm link font-bold hover:underline"
        >
          Clear all
        </button>
      </div>

      <!-- Filter Options -->
      <details class="group">
        <summary class="cursor-pointer text-sm font-bold hover:underline list-none">
          <span class="inline-flex items-center gap-2">
            Filter by author or tag
            <span class="group-open:rotate-180 transition-transform">▼</span>
          </span>
        </summary>
        <div class="mt-4 flex flex-col md:flex-row gap-6">
          <!-- Authors -->
          <div class="flex-1">
            <h3 class="text-sm font-bold mb-2">By Author</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="author in planetData.authors.slice(0, 10)"
                :key="author.username"
                @click="updateFilter('author', author.username)"
                :class="[
                  'px-3 py-1 text-sm transition-colors',
                  selectedAuthor === author.username
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-secondary-light/10 dark:bg-secondary-dark/10 hover:bg-secondary-light/20 dark:hover:bg-secondary-dark/20'
                ]"
              >
                {{ author.name }}
              </button>
            </div>
          </div>
          
          <!-- Tags -->
          <div class="flex-1">
            <h3 class="text-sm font-bold mb-2">By Tag</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in planetData.tags.slice(0, 15)"
                :key="tag.name"
                @click="updateFilter('tag', tag.name)"
                :class="[
                  'px-3 py-1 text-sm transition-colors',
                  selectedTag === tag.name
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-secondary-light/10 dark:bg-secondary-dark/10 hover:bg-secondary-light/20 dark:hover:bg-secondary-dark/20'
                ]"
              >
                {{ tag.name }} ({{ tag.count }})
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <NuxtLoadingIndicator />
      <p class="text-secondary-light/60 dark:text-secondary-dark/60">Loading posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center gap-2 py-12">
      <span>⚠️</span>
      <h5 class="text-base uppercase">Failed to Load Posts</h5>
      <p class="text-sm text-secondary-light/60 dark:text-secondary-dark/60">
        {{ error.message }}
      </p>
      <p class="text-sm text-secondary-light/60 dark:text-secondary-dark/60 mt-4">
        Run <code class="px-2 py-1 bg-secondary-light/10 dark:bg-secondary-dark/10">POST /api/planet/refresh</code> to fetch posts
      </p>
    </div>

    <!-- Posts List -->
    <div v-else-if="planetData?.posts && planetData.posts.length > 0" class="flex flex-col gap-6">
      <article
        v-for="(post, index) in planetData.posts"
        :key="post.id"
        class="flex flex-col gap-3 pb-6 border-custom-b"
      >
        <!-- Post Header -->
        <div class="flex flex-col gap-2">
          <nuxt-link 
            :to="`/planet/${post.slug}`"
            class="text-2xl font-bold link hover:underline"
          >
            {{ post.title }}
          </nuxt-link>
          
          <div class="flex flex-wrap items-center gap-3 text-sm text-secondary-light/60 dark:text-secondary-dark/60">
            <nuxt-link 
              :to="`/maintainers/${post.maintainerUsername}`"
              class="font-bold link hover:underline"
            >
              {{ post.maintainerName }}
            </nuxt-link>
            <span>•</span>
            <time :datetime="post.pubDate">
              {{ formatRelativeTime(post.pubDate) }}
            </time>
            <span v-if="post.author && post.author !== post.maintainerName">
              • by {{ post.author }}
            </span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2">
          <button
            v-for="tag in post.tags.slice(0, 5)"
            :key="tag"
            @click="updateFilter('tag', tag)"
            class="px-2 py-1 text-xs bg-secondary-light/10 dark:bg-secondary-dark/10 hover:bg-secondary-light/20 dark:hover:bg-secondary-dark/20 transition-colors"
          >
            {{ tag }}
          </button>
        </div>

        <!-- Post Content Preview -->
        <p v-if="post.contentSnippet" class="sans-text text-base">
          {{ truncateText(post.contentSnippet, 250) }}
        </p>

        <!-- Links -->
        <div class="flex gap-4 items-center text-sm">
          <nuxt-link 
            :to="`/planet/${post.slug}`"
            class="link font-bold hover:underline"
          >
            Read more →
          </nuxt-link>
          <a 
            :href="post.link" 
            target="_blank" 
            rel="noopener noreferrer"
            class="link hover:underline"
          >
            View original ↗
          </a>
        </div>
      </article>

      <!-- Pagination -->
      <div v-if="planetData.totalPages > 1" class="flex justify-center gap-2 pt-6">
        <button
          v-if="planetData.currentPage > 1"
          @click="goToPage(planetData.currentPage - 1)"
          class="px-4 py-2 border border-secondary-light/20 dark:border-secondary-dark/20 hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10 transition-colors"
        >
          ← Previous
        </button>
        
        <div class="flex gap-2 items-center">
          <button
            v-for="page in Math.min(planetData.totalPages, 5)"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 transition-colors',
              page === planetData.currentPage
                ? 'bg-primary-light dark:bg-primary-dark text-white font-bold'
                : 'border border-secondary-light/20 dark:border-secondary-dark/20 hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10'
            ]"
          >
            {{ page }}
          </button>
          <span v-if="planetData.totalPages > 5" class="px-2">...</span>
        </div>

        <button
          v-if="planetData.currentPage < planetData.totalPages"
          @click="goToPage(planetData.currentPage + 1)"
          class="px-4 py-2 border border-secondary-light/20 dark:border-secondary-dark/20 hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/10 transition-colors"
        >
          Next →
        </button>
      </div>

      <div class="text-center text-sm text-secondary-light/60 dark:text-secondary-dark/60">
        Showing {{ (planetData.currentPage - 1) * planetData.perPage + 1 }}-{{ Math.min(planetData.currentPage * planetData.perPage, planetData.totalPosts) }} of {{ planetData.totalPosts }} posts
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center gap-2 py-12">
      <span>📡</span>
      <h5 class="text-base uppercase">No Posts Yet</h5>
      <p class="text-sm text-secondary-light/60 dark:text-secondary-dark/60">
        Run <code class="px-2 py-1 bg-secondary-light/10 dark:bg-secondary-dark/10">POST /api/planet/refresh</code> to fetch posts from maintainers' RSS feeds
      </p>
    </div>
  </div>
</template>
