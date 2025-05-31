<script lang="ts" setup>
import { Header } from "#components";
</script>
<template>
  <div
    class="w-full place-items-center flex flex-col px-4 md:px-0 items-center"
  >
    <div
      class="max-w-screen-md w-full min-h-svh border-custom !border-t-0 !border-b-0"
    >
      <Header class="border-custom-b"></Header>
      <slot></slot>
    </div>
  </div>
  <Footer></Footer>
</template>
