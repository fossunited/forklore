<script lang="ts" setup>
const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});
</script>
<template>
  <div></div>
</template>
