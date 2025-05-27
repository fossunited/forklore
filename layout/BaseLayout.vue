<script lang="ts" setup>
import { Header, HomeHeader } from "#components";
</script>
<template>
  <div class="w-full place-items-center">
    <div
      class="max-w-screen-md w-full h-svh border-custom !border-t-0 !border-b-0"
    >
      <Header class="border-custom-b"></Header>
      <slot></slot>
    </div>
  </div>
</template>
