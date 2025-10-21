<template>
  <transition name="fade">
    <button
      v-if="visible"
      @click="scrollToTop"
      class="z-50 p-3 rounded-full text-white text-xl btn-subtle"
      :class="positionClasses"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const visible = ref(false)

// Show button after scrolling 300px
const toggleVisibility = () => {
  visible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Responsive positioning (Tailwind)
const positionClasses = computed(() => {
  return [
    'fixed',
    'bottom-6',
    'right-4',
  ];
});

onMounted(() => {
  window.addEventListener('scroll', toggleVisibility)
})

onUnmounted(() => {
  window.removeEventListener('scroll', toggleVisibility)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
