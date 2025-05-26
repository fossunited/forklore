<script lang="ts" setup>
import BaseLayout from '@/layout/BaseLayout.vue';
const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});
</script>
<template>
<BaseLayout></BaseLayout>
</template>
