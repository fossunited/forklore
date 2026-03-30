<script setup lang="ts">
interface Post {
  slug: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  maintainerName: string;
  maintainerUsername: string;
  maintainerPhoto?: string;
  feedUrl?: string;
  tags: string[];
}

const props = defineProps<{ username?: string }>();

const planetNav = usePlanetNav();
const setNavContext = () => {
  planetNav.value = props.username ? "user" : "planet";
};

const route = useRoute();
const router = useRouter();

const currentPage = computed(() => parseInt(route.query.page as string) || 1);
const selectedTag = computed(() => route.query.tag as string | undefined);
const searchInput = ref(!props.username ? (route.query.search as string) || "" : "");

const PER_PAGE = 20;

const { data: rawData, status, error } = await useAsyncData("planet-meta", async () => {
  const [planetDocs, maintainerDocs] = await Promise.all([
    queryCollection("planet").all(),
    queryCollection("maintainers").all(),
  ]);

  const photoMap: Record<string, string | undefined> = {};
  for (const m of maintainerDocs) {
    photoMap[m.username] = m.photo;
  }

  const posts: Post[] = planetDocs.flatMap((md) =>
    (md.posts || []).map((post: any) => ({
      slug: post.slug,
      title: post.title,
      link: post.link,
      pubDate: post.pubDate,
      contentSnippet: post.contentSnippet,
      tags: post.tags || [],
      // content intentionally excluded — not needed for list view
      maintainerName: md.maintainerName,
      maintainerUsername: md.maintainerUsername,
      maintainerPhoto: photoMap[md.maintainerUsername],
      feedUrl: md.feedUrl,
    })),
  );
  posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const authorMap = new Map<string, { username: string; name: string; photo?: string }>();
  for (const post of posts) {
    if (!authorMap.has(post.maintainerUsername)) {
      authorMap.set(post.maintainerUsername, {
        username: post.maintainerUsername,
        name: post.maintainerName,
        photo: photoMap[post.maintainerUsername],
      });
    }
  }

  return { posts, authors: Array.from(authorMap.values()) };
});

const filteredPosts = computed(() => {
  let posts = rawData.value?.posts || [];

  if (props.username) {
    posts = posts.filter(
      (p) => p.maintainerUsername.toLowerCase() === props.username!.toLowerCase(),
    );
  }
  if (selectedTag.value) {
    posts = posts.filter((p) =>
      p.tags.some((t: string) => t.toLowerCase() === selectedTag.value!.toLowerCase()),
    );
  }
  if (!props.username && searchInput.value) {
    const s = searchInput.value.toLowerCase();
    posts = posts.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(s) ||
        (p.contentSnippet || "").toLowerCase().includes(s),
    );
  }
  return posts;
});

const tags = computed(() => {
  // For username page, tags from that user's posts only (ignoring tag filter)
  const source = props.username
    ? (rawData.value?.posts || []).filter(
        (p) => p.maintainerUsername.toLowerCase() === props.username!.toLowerCase(),
      )
    : (rawData.value?.posts || []);
  const counts = source.flatMap((p) => p.tags as string[]).reduce(
    (acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; },
    {} as Record<string, number>,
  );
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

const data = computed(() => {
  if (!rawData.value) return null;
  const total = filteredPosts.value.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const start = (currentPage.value - 1) * PER_PAGE;
  return {
    posts: filteredPosts.value.slice(start, start + PER_PAGE),
    totalPosts: total,
    totalPages,
    currentPage: currentPage.value,
    perPage: PER_PAGE,
    authors: rawData.value.authors,
    tags: tags.value,
  };
});

let debounce: ReturnType<typeof setTimeout> | null = null;
watch(searchInput, (val) => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    const query: Record<string, any> = { ...route.query };
    if (val) query.search = val;
    else delete query.search;
    delete query.page;
    router.push({ query });
  }, 500);
});

const updateTag = (tag: string | undefined) => {
  const query: Record<string, any> = { ...route.query };
  if (tag) query.tag = tag;
  else delete query.tag;
  delete query.page;
  router.push({ query });
};

const goToPage = (page: number) => {
  router.push({ query: { ...route.query, page: page.toString() } });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const truncate = (text: string, max = 200) => {
  if (!text) return "";
  const s = text.replace(/<[^>]*>/g, "");
  return s.length <= max ? s : s.slice(0, max).trim() + "…";
};
</script>

<template>
  <!-- Search + filters (global only) -->
  <div v-if="!username && data" class="flex flex-col gap-4 p-4 md:p-8 border-custom-b">
    <input
      v-model="searchInput"
      type="text"
      placeholder="Search posts…"
      class="w-full px-4 py-2 bg-transparent border border-secondary-light/20 dark:border-secondary-dark/20 focus:outline-none focus:border-secondary-light dark:focus:border-secondary-dark"
    />

    <div v-if="selectedTag" class="flex items-center gap-2">
      <span class="text-xs font-bold opacity-60">Filtered by:</span>
      <button @click="updateTag(undefined)" class="btn-subtle px-3 py-1 text-xs">
        {{ selectedTag }} ✕
      </button>
    </div>

    <details class="group">
      <summary class="cursor-pointer text-sm font-bold hover:underline list-none flex items-center gap-2">
        Filter by author or tag
        <span class="group-open:rotate-180 transition-transform inline-block text-xs">▼</span>
      </summary>
      <div class="mt-4 flex flex-col gap-6">
        <!-- Authors -->
        <div>
          <h3 class="text-xs font-bold uppercase mb-3 opacity-60">By Author</h3>
          <div class="flex flex-wrap gap-2">
            <nuxt-link
              v-for="author in data.authors"
              :key="author.username"
              :to="`/planet/${author.username}`"
              class="flex items-center gap-2 px-3 py-1 text-sm bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80 transition-opacity"
            >
              <img v-if="author.photo" :src="author.photo" :alt="author.name" class="w-5 h-5 object-contain" />
              {{ author.name }}
            </nuxt-link>
          </div>
        </div>
        <!-- Tags -->
        <div>
          <h3 class="text-xs font-bold uppercase mb-3 opacity-60">By Tag</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in data.tags"
              :key="tag.name"
              @click="updateTag(tag.name)"
              :class="[
                'px-3 py-1 text-sm transition-colors',
                selectedTag === tag.name
                  ? 'bg-secondary-light dark:bg-secondary-dark text-primary-light dark:text-primary-dark'
                  : 'bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80',
              ]"
            >
              {{ tag.name }} <span class="opacity-50 text-xs">({{ tag.count }})</span>
            </button>
          </div>
        </div>
      </div>
    </details>
  </div>

  <!-- Tag filter (username page: compact, no accordion) -->
  <div v-if="username && data?.tags?.length" class="flex flex-wrap gap-2 p-4 md:p-8 border-custom-b">
    <span class="text-xs font-bold opacity-60 w-full">Filter by tag</span>
    <button
      v-for="tag in data.tags"
      :key="tag.name"
      @click="updateTag(selectedTag === tag.name ? undefined : tag.name)"
      :class="[
        'px-3 py-1 text-xs transition-colors',
        selectedTag === tag.name
          ? 'bg-secondary-light dark:bg-secondary-dark text-primary-light dark:text-primary-dark'
          : 'bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80',
      ]"
    >
      {{ tag.name }} <span class="opacity-50">({{ tag.count }})</span>
    </button>
    <button v-if="selectedTag" @click="updateTag(undefined)" class="text-xs hover:underline opacity-60">
      Clear ✕
    </button>
  </div>

  <!-- Loading -->
  <div v-if="status === 'pending'" class="flex justify-center py-16">
    <NuxtLoadingIndicator />
  </div>

  <!-- Error -->
  <div v-else-if="error" class="p-8 flex flex-col gap-2">
    <h5 class="font-bold uppercase text-sm">Failed to load posts</h5>
    <p class="text-xs opacity-60">{{ error.message }}</p>
  </div>

  <!-- Posts -->
  <div v-else-if="data?.posts?.length" class="flex flex-col gap-6 py-6">
    <article v-for="post in data.posts" :key="post.slug" class="flex flex-col">
      <!-- Title -->
      <div class="px-4 md:px-8 py-6 bg-tertiary-light dark:bg-tertiary-dark border-custom-b">
        <nuxt-link
          :to="`/planet/${post.maintainerUsername}/${post.slug}`"
          @click="setNavContext()"
          class="text-xl font-bold hover:underline"
        >
          {{ post.title }}
        </nuxt-link>
      </div>

      <!-- Body -->
      <div class="flex flex-col gap-3 px-4 md:px-8 py-6">
        <!-- Maintainer row (global only — redundant on username page since header shows it) -->
        <div v-if="!username" class="flex flex-wrap items-center gap-2 text-sm">
          <nuxt-link
            :to="`/planet/${post.maintainerUsername}`"
            class="flex items-center gap-2 font-bold hover:underline"
          >
            <img
              v-if="post.maintainerPhoto"
              :src="post.maintainerPhoto"
              :alt="post.maintainerName"
              class="w-6 h-6 aspect-square object-contain outline"
            />
            {{ post.maintainerName }}
          </nuxt-link>
          <span class="opacity-40">·</span>
          <time :datetime="post.pubDate" class="opacity-60 text-sm">{{ formatRelativeTime(post.pubDate) }}</time>
        </div>
        <div v-else class="flex items-center gap-2 text-sm opacity-60">
          <time :datetime="post.pubDate">{{ formatRelativeTime(post.pubDate) }}</time>
        </div>

        <!-- Tags -->
        <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in post.tags.slice(0, 6)"
            :key="tag"
            @click="updateTag(tag)"
            class="px-2 py-0.5 text-xs bg-tertiary-light dark:bg-tertiary-dark hover:opacity-80"
          >{{ tag }}</button>
        </div>

        <!-- Snippet -->
        <p v-if="post.contentSnippet" class="sans-text text-sm opacity-80">
          {{ truncate(post.contentSnippet) }}
        </p>

        <!-- Links -->
        <div class="flex gap-4 text-sm">
          <nuxt-link :to="`/planet/${post.maintainerUsername}/${post.slug}`" @click="setNavContext()" class="font-bold hover:underline">
            Read more →
          </nuxt-link>
          <a :href="post.link" target="_blank" rel="noopener noreferrer"
            class="opacity-60 hover:opacity-100 hover:underline">Original ↗</a>
        </div>
      </div>
    </article>

    <!-- Pagination -->
    <div v-if="data.totalPages > 1" class="flex justify-center gap-2 px-8">
      <button v-if="data.currentPage > 1" @click="goToPage(data.currentPage - 1)"
        class="btn-outline px-4 py-2 text-sm">← Prev</button>
      <button
        v-for="page in Math.min(data.totalPages, 7)"
        :key="page"
        @click="goToPage(page)"
        :class="page === data.currentPage ? 'btn-solid px-4 py-2 text-sm' : 'btn-outline px-4 py-2 text-sm'"
      >{{ page }}</button>
      <span v-if="data.totalPages > 7" class="flex items-center px-2 opacity-40">…</span>
      <button v-if="data.currentPage < data.totalPages" @click="goToPage(data.currentPage + 1)"
        class="btn-outline px-4 py-2 text-sm">Next →</button>
    </div>

    <p class="text-center text-xs opacity-50">
      {{ (data.currentPage - 1) * data.perPage + 1 }}–{{ Math.min(data.currentPage * data.perPage, data.totalPosts) }}
      of {{ data.totalPosts }} posts
    </p>
  </div>

  <!-- Empty -->
  <div v-else class="flex flex-col items-center gap-2 py-16">
    <h5 class="font-bold uppercase text-sm">No Posts Yet</h5>
    <p class="text-xs opacity-60">
      <template v-if="username">No blog posts found for this maintainer.</template>
      <template v-else>Run <code class="px-1.5 py-0.5 bg-tertiary-light dark:bg-tertiary-dark">yarn planet:refresh</code> to fetch posts.</template>
    </p>
  </div>
</template>
