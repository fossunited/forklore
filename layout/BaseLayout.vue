<script lang="ts" setup>
import { Header } from "#components";
</script>
<template>
  <div class="w-full place-items-center flex flex-col items-center">
    <div
      class="max-w-screen-md w-full min-h-svh border-custom !border-t-0 !border-b-0"
    >
      <Header class="border-custom-b"></Header>
      <slot></slot>
    </div>
    <Footer></Footer>
  </div>
</template>
