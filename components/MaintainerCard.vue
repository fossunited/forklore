<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps(["maintainer"]);

// Generate a beautiful color for each maintainer based on their name
const cardHue = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.maintainer.full_name.length; i++) {
    hash = props.maintainer.full_name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
});

// Generate random emojis for slam book feel
const emojis = ['🌟', '💫', '🚀', '🦄', '🌸', '💝', '🎨', '🎭', '💖', '✨', '🌈', '🔥']
const randomEmoji = computed(() => {
  const index = Math.abs(cardHue.value % emojis.length)
  return emojis[index]
})
</script>
<template>
  <div
    class="group relative transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer"
    tabindex="0"
    role="button"
    @click="$router.push(maintainer.path)"
    @keydown.enter="$router.push(maintainer.path)"
    @keydown.space.prevent="$router.push(maintainer.path)"
    :style="{ '--card-hue': cardHue }"
  >
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 rounded-3xl"></div>
    
    <!-- Hover Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-xl"
         :style="{ background: `linear-gradient(135deg, hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%))` }">
    </div>
    
    <!-- Card Border -->
    <div class="absolute inset-0 bg-gradient-to-br p-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
         :style="{ background: `linear-gradient(135deg, hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%))` }">
      <div class="w-full h-full bg-white dark:bg-gray-900 rounded-3xl"></div>
    </div>

    <!-- Main Content -->
    <div class="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
      <!-- Header Section with Slam Book Aesthetic -->
      <div class="relative p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-blue-50/50 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-blue-900/20">
        <!-- Subtle Floating Emoji -->
        <div class="absolute top-4 right-4 text-2xl opacity-30 group-hover:opacity-70 transition-opacity duration-300">
          {{ randomEmoji }}
        </div>
        
        <!-- Decorative Corner -->
        <div class="absolute top-0 left-0 w-16 h-16 opacity-10">
          <div class="w-full h-full bg-gradient-to-br rounded-br-full"
               :style="{ background: `linear-gradient(135deg, hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%))` }">
          </div>
        </div>

        <!-- Profile Section -->
        <div class="flex gap-6 items-center relative z-10">
          <!-- Avatar with beautiful styling -->
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-br rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                 :style="{ background: `linear-gradient(135deg, hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%))` }">
            </div>
            <div class="relative transform transition-all duration-300 group-hover:scale-110">
              <MaintainerImage :maintainer="maintainer" class="rounded-2xl" />
            </div>
            
            <!-- Status Indicator -->
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></div>
          </div>

          <!-- Info Section -->
          <div class="flex flex-col space-y-2 flex-1">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
                :style="{ '--tw-gradient-stops': `hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%)` }">
              {{ maintainer.full_name }}
            </h4>
            <p class="text-gray-600 dark:text-gray-300 font-medium">
              {{ maintainer.designation }}
            </p>
            
            <!-- Slam Book Style Details -->
            <div class="flex items-center space-x-3 mt-2">
              <span class="px-3 py-1 bg-white/60 dark:bg-gray-700/50 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-white/30 dark:border-gray-600/30">
                ✨ Open Source Keeper
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                📅 {{ maintainer.projects.length }} project{{ maintainer.projects.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Decorative Lines -->
        <div class="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
      </div>

      <!-- Projects Section -->
      <div class="p-6">
        <div class="mb-4 flex items-center space-x-2">
          <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Their Code Stories</h5>
          <div class="flex-1 h-[1px] bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 gap-4"
             :class="{
               'md:grid-cols-2': maintainer.projects.length > 1
             }">
          <div
            v-for="(project, index) in maintainer.projects"
            :key="project.name"
            class="group/project relative p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <!-- Project Content -->
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg bg-white flex items-center justify-center">
                <img
                  v-if="project.logo"
                  class="max-w-full max-h-full object-contain"
                  :src="project.logo"
                  :alt="`Logo of ${project.name}`"
                />
                <div
                  v-else
                  class="text-xs font-bold text-gray-600 text-center px-1"
                >
                  {{ project.name?.slice(0, 3)?.toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h6 class="font-semibold text-gray-800 dark:text-white text-sm truncate group-hover/project:text-purple-600 dark:group-hover/project:text-purple-400 transition-colors duration-200">
                  {{ project.name }}
                </h6>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ project.short_description || project.description }}
                </p>
              </div>
            </div>

            <!-- Hover Effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover/project:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

      <!-- Footer with Call to Action -->
      <div class="px-8 pb-6">
        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100/50 via-gray-50/30 to-gray-100/50 dark:from-gray-800/50 dark:via-gray-700/30 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/30">
          <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
            📖 Read their story
          </span>
          <div class="flex items-center text-purple-600 dark:text-purple-400 group-hover:translate-x-2 transition-transform duration-300">
            <span class="text-sm font-semibold mr-2">View Profile</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtle Floating Particle -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      <div class="absolute top-1/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-40 animate-ping" style="animation-delay: 1s;"></div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom hover animation */
.group:hover .animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Focus styles for accessibility */
.group:focus-visible {
  outline: 2px solid rgb(147 51 234);
  outline-offset: 4px;
}
</style>
