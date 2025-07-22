<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const query = defineModel<string>();

const inputRef = ref<HTMLInputElement | null>(null);
const isSearching = ref(false);
const isFocused = ref(false);

// Search suggestions (you can make this dynamic)
const suggestions = ref([
  'Python developers', 'React maintainers', 'AI/ML projects', 'Web frameworks', 
  'Database tools', 'DevOps automation', 'Mobile apps', 'Open source libraries'
]);

const randomSuggestion = ref('');

const getRandomSuggestion = () => {
  const random = suggestions.value[Math.floor(Math.random() * suggestions.value.length)];
  randomSuggestion.value = random;
};

// Handle keyboard shortcut
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    inputRef.value?.focus?.();
  }
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  isFocused.value = false;
};

onMounted(() => {
  getRandomSuggestion();
  document.addEventListener('keydown', handleKeyDown);
  setInterval(getRandomSuggestion, 5000); // Change suggestion every 5 seconds
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

defineExpose({ 
  focus: () => {
    inputRef.value?.focus?.();
    isFocused.value = true;
  }
});
</script>

<template>
  <div class="relative group">
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/10 dark:to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <!-- Animated Border -->
    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl p-[1px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
      <div class="w-full h-full bg-white dark:bg-gray-900 rounded-2xl"></div>
    </div>

    <!-- Main Search Container -->
    <div 
      :class="[
        'relative flex items-center px-6 py-4 gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border transition-all duration-300',
        isFocused 
          ? 'border-purple-300 dark:border-purple-600 shadow-lg shadow-purple-500/20' 
          : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
      ]"
    >
      <!-- Search Icon with Animation -->
      <div class="relative">
        <div 
          :class="[
            'absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-0 transition-opacity duration-300',
            isFocused ? 'opacity-30' : ''
          ]"
        ></div>
        <IconsSearch 
          :class="[
            'relative w-5 h-5 transition-all duration-300',
            isFocused 
              ? 'text-purple-600 dark:text-purple-400 scale-110' 
              : 'text-gray-500 dark:text-gray-400'
          ]" 
        />
      </div>

      <!-- Input Field -->
      <div class="flex-1 relative">
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          :placeholder="query ? '' : `Search for ${randomSuggestion}...`"
          @focus="handleFocus"
          @blur="handleBlur"
          class="w-full bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none font-medium"
        />
        
        <!-- Typing Animation -->
        <div 
          v-if="!query && !isFocused" 
          class="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div class="text-gray-400 dark:text-gray-500 font-medium">
            Search for {{ randomSuggestion }}...
            <span class="animate-pulse">|</span>
          </div>
        </div>
      </div>

      <!-- Keyboard Shortcut -->
      <div 
        :class="[
          'hidden md:flex items-center space-x-1 px-3 py-1 rounded-lg border transition-all duration-300 text-xs font-medium',
          isFocused 
            ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
        ]"
      >
        <span>⌘</span>
        <span>K</span>
      </div>

      <!-- Search Results Count (when searching) -->
      <Transition name="fade">
        <div 
          v-if="query && query.length > 0"
          class="flex items-center space-x-2"
        >
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Searching...
          </span>
        </div>
      </Transition>
    </div>

    <!-- Search Suggestions Dropdown (when focused and no query) -->
    <Transition name="dropdown">
      <div 
        v-if="isFocused && !query"
        class="absolute top-full mt-2 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden"
      >
        <div class="p-4">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Popular Searches
          </h4>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="suggestion in suggestions.slice(0, 6)" 
              :key="suggestion"
              @click="query = suggestion"
              class="text-left p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ suggestion }}</span>
            </button>
          </div>
        </div>
        
        <div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
          <div class="flex items-center justify-between pt-3">
            <span class="text-xs text-gray-400">💡 Tip: Use Cmd+K to search anytime</span>
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-ping" style="animation-delay: 0s;"></div>
              <div class="w-2 h-2 bg-pink-400 rounded-full opacity-30 animate-ping" style="animation-delay: 0.5s;"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-ping" style="animation-delay: 1s;"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Subtle Hover Effect -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      <div class="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-30 animate-ping" style="animation-delay: 1s;"></div>
    </div>
  </div>
</template>

<style scoped>
/* Transition Animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Custom Ping Animation */
.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Subtle Glow Effect */
.group:hover .animate-ping {
  animation-duration: 1.5s;
}

/* Focus Ring for Accessibility */
.group:focus-within {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
