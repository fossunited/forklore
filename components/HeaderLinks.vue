<script setup lang="ts">
const navbarItems = [
  {
    label: "Get featured",
    href: "https://github.com/fossunited/forklore/blob/develop/GET_FEATURED.md",
  },
  {
    label: "FOSS United Grants",
    href: "https://fossunited.org/grants",
  },
  {
    label: "Discussion Forum",
    href: "https://forum.fossunited.org/c/maintainers/",
  },
];
</script>
<template>
  <ol class="flex flex-col items-end md:flex-row text-sm">
    <li class="py-2 px-3" v-for="item in navbarItems" :key="item.label">
      <a :href="item.href">
        {{ item.label }}
      </a>
    </li>
  </ol>
</template>
