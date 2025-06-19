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
];
</script>
<template>
  <ol class="flex flex-col items-end md:flex-row">
    <li class="py-2 px-4" v-for="item in navbarItems" :key="item.label">
      <a :href="item.href">
        {{ item.label }}
      </a>
    </li>
  </ol>
</template>
