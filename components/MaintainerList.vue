<script setup lang="ts">
const { data: maintainers } = await useAsyncData("maintainers", () => {
  return queryCollection("maintainers").all();
});
</script>

<template>
  <div class="flex flex-col gap-8 px-8 py-10">
    <MaintainerCard
      v-for="maintainer in maintainers"
      :key="maintainer.id"
      :maintainer="maintainer"
    />
  </div>
</template>
