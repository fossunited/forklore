<script setup lang="ts">
import { computed } from 'vue'
import iconMapper from "~/utils/icons";

const props = defineProps(["maintainer"]);

// Generate a beautiful color for each maintainer based on their name
const cardHue = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.maintainer.full_name.length; i++) {
    hash = props.maintainer.full_name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
});
</script>
<template>
  <div class="relative p-8 flex flex-col gap-6 overflow-hidden bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-blue-900/70 dark:from-purple-900/90 dark:via-pink-900/70 dark:to-blue-900/80 backdrop-blur-sm border border-white/10 shadow-2xl">
    <!-- Animated background pattern -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>
    
    <!-- Decorative floating elements -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-6 right-6 text-3xl opacity-30 animate-bounce" style="animation-delay: 0.5s;">✨</div>
      <div class="absolute bottom-6 left-6 text-2xl opacity-20 animate-pulse" style="animation-delay: 1.5s;">💫</div>
    </div>

    <h2 class="text-xl font-light uppercase relative z-10 group text-white/90 drop-shadow-lg">
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300">M</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.1s;">a</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.2s;">i</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.3s;">n</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.4s;">t</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.5s;">a</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.6s;">i</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.7s;">n</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.8s;">e</span>
      <span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300" style="animation-delay: 0.9s;">r</span>
    </h2>
    
    <div class="flex gap-4 items-start relative z-10">
      <!-- Animated avatar container -->
      <div class="relative group/avatar">
        <div class="absolute inset-0 bg-gradient-to-br rounded-full opacity-0 group-hover/avatar:opacity-30 transition-all duration-500 animate-spin-slow"
             :style="{ background: `linear-gradient(135deg, hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%))` }">
        </div>
        <div class="relative transform transition-all duration-300 group-hover/avatar:scale-105">
          <MaintainerImage :maintainer="maintainer" class="relative z-10" />
        </div>
        <!-- Animated pulse ring -->
        <div class="absolute inset-0 border-2 rounded-full opacity-0 group-hover/avatar:opacity-100 animate-ping"
             :style="{ borderColor: `hsl(${cardHue}, 70%, 50%)` }"></div>
      </div>
      
      <div class="flex flex-col gap-2">
        <h1 class="font-bold text-xl group hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r transition-all duration-300 cursor-default text-white drop-shadow-md"
            :style="{ '--tw-gradient-stops': `hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%)` }">
          {{ maintainer.full_name }}
        </h1>
        <p class="text-base group hover:translate-x-2 transition-transform duration-300 cursor-default text-white/80 drop-shadow-sm">
          {{ maintainer.designation }}
        </p>
        <div class="flex gap-3 items-center">
          <a
            v-for="(social, index) in maintainer.socials"
            :key="social.label"
            :href="social.link"
            target="_blank"
            class="group/social relative transform transition-all duration-300 hover:scale-125 hover:-translate-y-1"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <!-- Animated background -->
            <div class="absolute inset-0 bg-gradient-to-br rounded-lg opacity-0 group-hover/social:opacity-20 transition-opacity duration-300 animate-pulse"
                 :style="{ background: `linear-gradient(135deg, hsl(${cardHue}, 70%, 50%), hsl(${cardHue + 60}, 70%, 60%))` }">
            </div>
            
            <!-- Icon with hover effect -->
            <component
              class="w-5 h-5 relative z-10 transition-all duration-300 text-white/70 group-hover/social:text-white group-hover/social:drop-shadow-lg"
              :is="iconMapper(social.label)"
            ></component>
            
            <!-- Animated ring on hover -->
            <div class="absolute inset-0 border border-current rounded opacity-0 group-hover/social:opacity-100 animate-ping"
                 style="animation-duration: 1.5s;"></div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

/* Letter hover animation */
.group:hover span {
  animation: bounce-letter 0.6s ease-in-out;
}

@keyframes bounce-letter {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
