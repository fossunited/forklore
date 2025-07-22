<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const colorMode = useColorMode();

const getLogoPath = () => {
  if (colorMode.value === "dark") {
    return "logo/logo_light.svg";
  } else if (colorMode.value === "light") {
    return "logo/logo_dark.svg";
  }

  return "logo/logo_light.svg";
};

// Get real maintainers data for statistics
const { data: maintainers } = await useAsyncData("home-maintainers", () => {
  return queryCollection("maintainers").all();
});

// Calculate real statistics
const totalMaintainers = computed(() => maintainers.value?.length || 0)
const totalProjects = computed(() => {
  if (!maintainers.value) return 0
  return maintainers.value.reduce((sum, maintainer) => sum + (maintainer.projects?.length || 0), 0)
})

// Animated typing effect
const typewriterText = ref('')
const fullText = "Like a slam book, but with fewer crushes and more commits"
let currentIndex = 0
let typingInterval: NodeJS.Timeout

const startTyping = () => {
  typingInterval = setInterval(() => {
    if (currentIndex <= fullText.length) {
      typewriterText.value = fullText.slice(0, currentIndex)
      currentIndex++
    } else {
      clearInterval(typingInterval)
    }
  }, 80)
}

onMounted(() => {
  setTimeout(startTyping, 1000)
})

onUnmounted(() => {
  if (typingInterval) clearInterval(typingInterval)
})
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20 dark:from-purple-800/30 dark:via-blue-800/20 dark:to-pink-800/30"></div>
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-30"></div>
    
    <!-- Floating Elements (Minimal and Subtle) -->
    <div class="absolute top-32 right-20 text-2xl opacity-30 hover:opacity-60 transition-opacity duration-500 animate-bounce" style="animation-delay: 2s">✨</div>

    <!-- Main Content -->
    <div class="relative z-10 px-8 pt-40 pb-8 space-y-8">
      <!-- Logo with Animation -->
      <div class="transform transition-all duration-300 hover:scale-105">
        <div class="relative inline-block">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg blur-lg opacity-20 animate-pulse"></div>
          <div class="relative bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-white/10 inline-block">
            <img :src="getLogoPath()" alt="forklore logo" class="h-8 w-auto block" />
          </div>
        </div>
      </div>

      <!-- Credits with beautiful styling -->
      <div class="flex items-center space-x-2 text-sm">
        <span class="text-gray-600 dark:text-gray-300">crafted with</span>
        <span class="text-red-500 animate-pulse">❤️</span>
        <span class="text-gray-600 dark:text-gray-300">by</span>
        <a 
          href="https://fossunited.org" 
          class="group relative font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
        >
          FOSS United
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
        </a>
      </div>
    </div>

    <!-- Description Section -->
    <div class="relative z-10 px-8 py-16 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-blue-50/50 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-blue-900/20 backdrop-blur-sm border-t border-b border-white/20 dark:border-white/10">
      <!-- Typewriter Effect -->
      <div class="mb-8">
        <p class="text-xl font-bold text-gray-800 dark:text-gray-100 min-h-[2rem]">
          {{ typewriterText }}
          <span v-if="typewriterText.length < fullText.length" class="animate-pulse border-r-2 border-purple-500 pr-1"></span>
        </p>
      </div>

      <!-- Main Description with Cards -->
      <div class="grid md:grid-cols-2 gap-8">
        <div class="group">
          <div class="relative p-6 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/10 to-blue-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  📖
                </div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Digital Slam Book</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Forklore brings you confessions, quirks, and the occasional rant from India's open source keepers.
              </p>
            </div>
          </div>
        </div>

        <div class="group">
          <div class="relative p-6 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-green-400/10 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  👥
                </div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Open Source Community</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Meet the passionate developers, their stories, projects, and the code that drives innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-12 grid grid-cols-3 gap-6">
        <div class="text-center group cursor-pointer">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 transform group-hover:scale-110"></div>
            <div class="relative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2">
              {{ totalMaintainers }}
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Maintainers</p>
        </div>
        
        <div class="text-center group cursor-pointer">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 transform group-hover:scale-110"></div>
            <div class="relative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 mb-2">
              {{ totalProjects }}
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Projects</p>
        </div>
        
        <div class="text-center group cursor-pointer">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-green-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 transform group-hover:scale-110"></div>
            <div class="relative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-purple-500 mb-2">
              {{ totalMaintainers }}
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Stories</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: float 3s ease-in-out infinite;
}
</style>
