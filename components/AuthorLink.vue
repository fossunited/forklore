<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ author: string }>()

const maintainer = ref(null)

const fetchMaintainer = async (username: string) => {
  if (!username) {
    maintainer.value = null
    return
  }

  const { data } = await useAsyncData(
    () => `maintainer-${username}`,
    () =>
      queryCollection('maintainers')
        .where('username', '==', username)
        .first()
  )
  maintainer.value = data.value
}

watch(
  () => props.author,
  (newAuthor) => {
    fetchMaintainer(newAuthor)
  },
  { immediate: true }
)
</script>

<template>
  <span>
    <template v-if="maintainer">
      <NuxtLink :to="`/maintainers/${maintainer.username}`" class="underline text-primary">
        {{ maintainer.full_name || maintainer.username }}
      </NuxtLink>
    </template>
    <template v-else>
      <strong>{{ author }}</strong>
    </template>
  </span>
</template>
