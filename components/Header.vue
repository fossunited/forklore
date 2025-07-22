<script setup lang="ts">
import { computed } from "vue";
const colorMode = useColorMode();

const getLogoPath = () => {
  if (colorMode.value === "dark") {
    return "/logo/logo_light.svg";
  } else if (colorMode.value === "light") {
    return "/logo/logo_dark.svg";
  }

  return "/logo/logo_light.svg";
};

const showHeaderLinks = ref(false);
</script>
<template>
  <div class="relative">
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-blue-500/10"></div>
    
    <nav class="relative z-10 p-8 flex justify-between items-center backdrop-blur-sm">
      <!-- Logo Section -->
      <div class="flex gap-3 items-center">
        <nuxt-link to="/" class="group">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div class="relative bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-white/10 transform transition-all duration-300 group-hover:scale-105">
              <img :src="getLogoPath()" alt="forklore logo" class="h-8" />
            </div>
          </div>
        </nuxt-link>
      </div>

      <!-- Navigation Section -->
      <div class="flex items-center gap-4">
        <header-links class="hidden md:flex"></header-links>
        
        <!-- Beautiful Theme Switcher -->
        <ThemeSwitcher />
        
        <!-- Mobile Menu Button -->
        <button
          class="relative p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 md:!hidden transition-all duration-300 hover:scale-110 hover:bg-white/20 dark:hover:bg-black/30"
          @click="showHeaderLinks = !showHeaderLinks"
          aria-label="Toggle Header Links"
          :aria-expanded="showHeaderLinks"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          <IconsMenu class="relative w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-500 ease-in-out"
      enter-from-class="opacity-0 -translate-y-4 max-h-0 overflow-hidden"
      enter-to-class="opacity-100 translate-y-0 max-h-96"
      leave-active-class="transition-all duration-500 ease-in-out"
      leave-from-class="opacity-100 translate-y-0 max-h-96"
      leave-to-class="opacity-0 -translate-y-4 max-h-0 overflow-hidden"
    >
      <div v-if="showHeaderLinks" class="relative z-10">
        <div class="mx-4 mb-4 p-4 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
          <header-links class="flex flex-col space-y-2"></header-links>
        </div>
      </div>
    </Transition>
  </div>
</template>
