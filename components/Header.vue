<script setup lang="ts">
import { computed } from "vue";
import LightModeIcon from "@/components/icons/LightModeIcon.vue";
import DarkModeIcon from "@/components/icons/DarkModeIcon.vue";
const colorMode = useColorMode();

const getLogoPath = () => {
  if (colorMode.value === "dark") {
    return "/logo/logo_light.svg";
  } else if (colorMode.value === "light") {
    return "/logo/logo_dark.svg";
  }

  return "/logo/logo_light.svg";
};

const getButtonIcon = () => {
  if (colorMode.value === "dark") {
    return LightModeIcon;
  } else if (colorMode.value === "light") {
    return DarkModeIcon;
  }

  return LightModeIcon;
};

const toggleColorMode = () => {
  if (colorMode.value === "dark") {
    colorMode.preference = "light";
    colorMode.value = "light";
  } else {
    colorMode.preference = "dark";
    colorMode.value = "dark";
  }
};

const themeButtonLabel = computed(() => {
  return colorMode.value === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
});

const showHeaderLinks = ref(false);
</script>
<template>
  <div>
    <nav class="p-9 flex justify-between items-center">
      <div class="flex gap-2 items-center">
        <nuxt-link to="/">
          <img :src="getLogoPath()" alt="forklore logo" />
        </nuxt-link>
      </div>

      <div class="flex gap-2">
        <header-links class="hidden md:flex"></header-links>
        <button class="btn-solid" @click="toggleColorMode()" :aria-label="themeButtonLabel">
          <component :is="getButtonIcon()" />
        </button>
        <button
          class="btn-subtle block md:!hidden"
          @click="showHeaderLinks = !showHeaderLinks"
          aria-label="Toggle Header Links"
          :aria-expanded="showHeaderLinks"
        >
          <IconsMenu class="w-5 h-5" />
        </button>
      </div>
    </nav>
    <Transition
      enter-active-class="transition-all duration-500 ease-in-out"
      enter-from-class="opacity-0 -translate-y-2 max-h-0 overflow-hidden"
      enter-to-class="opacity-100 translate-y-0 max-h-96"
      leave-active-class="transition-all duration-500 ease-in-out"
      leave-from-class="opacity-100 translate-y-0 max-h-96"
      leave-to-class="opacity-0 -translate-y-2 max-h-0 overflow-hidden"
    >
      <div v-if="showHeaderLinks">
        <header-links class="px-4 pb-2 -mt-2"></header-links>
      </div>
    </Transition>
  </div>
</template>
