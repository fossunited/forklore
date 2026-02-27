<script setup lang="ts">
defineProps<{
  maintainer: {
    full_name: string;
    designation: string;
    photo?: string;
    projects: Array<{
      name: string;
      short_description: string;
      logo?: string;
    }>;
  };
}>();
</script>

<template>
  <div class="w-full h-full flex items-center justify-center p-12 bg-[#18222a]">
    <div class="flex flex-col w-full max-w-6xl border border-[#3c4b4e]">
      <!-- Header -->
      <div class="p-12 flex gap-4 items-center bg-[#3c4b4e]">
        <!-- Photo -->
        <img
          :src="maintainer.photo || '/maintainer_photo_dark.svg'"
          :alt="`Photo of ${maintainer.full_name}`"
          class="w-24 h-24 object-contain outline outline-[#cff2da]"
        />

        <!-- Name -->
        <div class="flex flex-col gap-2 ml-4">
          <h4 class="font-normal text-5xl text-[#cff2da]">
            {{ maintainer.full_name }}
          </h4>
          <div class="text-2xl text-[#cff2da]">
            {{ maintainer.designation }}
          </div>
        </div>
      </div>

      <!-- Projects -->
      <div
        class="grid"
        :class="maintainer.projects?.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <div
          v-for="(project, idx) in maintainer.projects?.slice(0, 4)"
          :key="idx"
          class="p-8 flex flex-col gap-4 bg-[#18222a] border-t border-[#3c4b4e]"
          :class="{
            'border-r border-[#3c4b4e]':
              idx % 2 === 0 && maintainer.projects.length > 1,
          }"
        >
          <div class="flex gap-6 items-start">
            <!-- Logo -->
            <img
              v-if="project.logo"
              :src="project.logo"
              :alt="`Logo of ${project.name}`"
              class="h-20 aspect-[3/2] object-contain p-3 bg-white/96"
            />
            <div
              v-else
              class="h-20 aspect-[3/2] flex items-center justify-center p-3 bg-white text-black uppercase font-black text-sm border border-[#eef0f1]"
            >
              <span>{{ project.name.slice(0, 20) }}...</span>
            </div>

            <h5 class="font-normal text-3xl ml-2 text-[#cff2da]">
              {{ project.name }}
            </h5>
          </div>

          <p class="text-xl leading-relaxed text-[#cff2da]">
            {{ project.short_description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
