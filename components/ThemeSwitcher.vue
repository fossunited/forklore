<template>
  <button 
    @click="toggleTheme"
    :class="[
      'relative p-3 rounded-full transition-all duration-300',
      'bg-white/20 dark:bg-black/20 backdrop-blur-md',
      'border border-white/30 dark:border-white/10',
      'hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25',
      'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
    ]"
    :aria-label="themeButtonLabel"
  >
    <div class="relative">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-20"></div>
      <component 
        :is="getCurrentIcon()" 
        :class="[
          'w-6 h-6 transition-all duration-300',
          currentMode === 'dark' ? 'text-yellow-400' : 'text-gray-600 dark:text-yellow-400'
        ]"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LightModeIcon from "@/components/icons/LightModeIcon.vue"
import DarkModeIcon from "@/components/icons/DarkModeIcon.vue"

// Theme state
const colorMode = useColorMode()

const currentMode = computed(() => colorMode.value)

// Methods
const toggleTheme = () => {
  colorMode.forced = true
  
  if (colorMode.value === 'dark') {
    colorMode.preference = 'light'
    colorMode.value = 'light'
  } else {
    colorMode.preference = 'dark'
    colorMode.value = 'dark'
  }
}

const getCurrentIcon = () => {
  return currentMode.value === 'dark' ? LightModeIcon : DarkModeIcon
}

const themeButtonLabel = computed(() => {
  return colorMode.value === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
})
</script>

