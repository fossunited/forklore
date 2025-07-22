<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps(["maintainer"]);

// Generate consistent color for this maintainer  
const maintainerHue = computed(() => {
  if (!props.maintainer?.full_name) return 280;
  let hash = 0;
  for (let i = 0; i < props.maintainer.full_name.length; i++) {
    hash = props.maintainer.full_name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
});

// Function to detect and format URLs
const formatResponseText = (text: string) => {
  if (!text) return text;
  
  // Regular expression to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="url-link">${url}</a>`;
  });
};
</script>
<template>
  <div class="space-y-8 p-6">
    <template v-for="(item, index) in maintainer.form" :key="item.question">
      <div
        v-if="item.response"
        class="group relative"
        :style="{ '--item-hue': (maintainerHue + index * 30) % 360 }"
      >
        <!-- Question & Answer Card -->
        <div class="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-pink-50/10 to-blue-50/20 dark:from-purple-900/10 dark:via-pink-900/5 dark:to-blue-900/10"></div>
          
          <!-- Question Header -->
          <div class="relative z-10 px-6 py-4 bg-gradient-to-r from-gray-50/80 via-gray-100/60 to-gray-50/80 dark:from-gray-800/80 dark:via-gray-700/60 dark:to-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-600/20">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md"
                   :style="{ background: `linear-gradient(135deg, hsl(${(maintainerHue + index * 30) % 360}, 70%, 50%), hsl(${(maintainerHue + index * 30 + 60) % 360}, 70%, 60%))` }">
                {{ index + 1 }}
              </div>
              <h4 class="font-semibold text-gray-800 dark:text-white leading-relaxed flex-1 min-w-0 break-words">
                {{ item.question }}
              </h4>
            </div>
          </div>

          <!-- Answer Content -->
          <div class="relative z-10 p-6">
            <div class="prose prose-gray dark:prose-invert max-w-none">
              <div 
                class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto"
                v-html="formatResponseText(item.response)"
              />
            </div>
          </div>

          <!-- Decorative Bottom Line -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-30"
               :style="{ background: `linear-gradient(to right, hsl(${(maintainerHue + index * 30) % 360}, 70%, 50%), hsl(${(maintainerHue + index * 30 + 60) % 360}, 70%, 60%))` }">
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* URL Link Styling */
:deep(.url-link) {
  color: #2563eb;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
  word-break: break-all;
  overflow-wrap: break-word;
  hyphens: auto;
}

:deep(.url-link:hover) {
  color: #1d4ed8;
}

.dark :deep(.url-link) {
  color: #60a5fa;
}

.dark :deep(.url-link:hover) {
  color: #93c5fd;
}

/* Text wrapping and overflow handling */
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}

/* Ensure proper text wrapping in all containers */
.prose {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

/* Handle long URLs specifically */
.prose :deep(a) {
  word-break: break-all;
  overflow-wrap: break-word;
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .prose {
    font-size: 0.9rem;
    line-height: 1.6;
  }
}
</style>
