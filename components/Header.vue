<script setup lang="ts">
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
  colorMode.forced = true;

  if (colorMode.value === "dark") {
    colorMode.preference = "light";
    colorMode.value = "light";
  } else {
    colorMode.preference = "dark";
    colorMode.value = "dark";
  }
};

const navbarItems = [
  {
    label: "Get featured",
    href: "#",
  },
  {
    label: "FOSS United Grants",
    href: "#",
  },
];
</script>
<template>
  <nav class="p-9 flex justify-between items-center">
    <nuxt-link to="/">
      <img :src="getLogoPath()" alt="forklore logo" />
    </nuxt-link>

    <div class="flex gap-2">
      <ol class="flex">
        <li class="py-2 px-4" v-for="item in navbarItems" :key="item.label">
          <a :href="item.href">
            {{ item.label }}
          </a>
        </li>
      </ol>

      <button class="btn-solid" @click="toggleColorMode()">
        <component :is="getButtonIcon()" />
      </button>
    </div>
  </nav>
</template>
