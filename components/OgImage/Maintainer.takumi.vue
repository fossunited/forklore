<script setup lang="ts">
defineProps<{
  maintainer: {
    full_name: string;
    designation: string;
    photo?: string;
    projects: Array<{
      name: string;
      logo?: string;
    }>;
  };
}>();
</script>

<template>
  <div class="relative w-full h-full">
    <!-- Background Image -->
    <img
      src="/og_maintainer_bg.png"
      class="absolute inset-0 w-full h-full object-cover"
    />

    <!-- Content Overlay -->
    <div class="absolute inset-0 flex flex-col justify-between p-26 mr-8">
      <!-- Maintainer Info -->
      <div class="flex gap-8 items-center justify-end">
        <div class="flex flex-col items-end gap-10 mr-5 font-['Geist_Mono']">
          <h1
            class="text-[60px] font-bold text-[#CFF2DA] text-right tracking-[2px]"
          >
            {{ maintainer.full_name }}
          </h1>

          <p
            class="text-3xl font-medium text-[#CFF2DA] text-right mt-2 leading-[100%] tracking-[-1.04px]"
          >
            {{ maintainer.designation }}
          </p>
        </div>

        <!-- Photo -->
        <img
          :src="maintainer.photo || '/maintainer_photo_dark.svg'"
          :alt="maintainer.full_name"
          class="w-45 h-45 object-cover bg-[#eef0f1] outline outline-[#cff2da]"
        />
      </div>

      <!-- Project Icons -->
      <div class="flex justify-center ml-[50%]">
        <div class="flex gap-50 p-8 items-center">
          <!-- Show project name if only 1 project -->
          <h2
            v-if="maintainer.projects?.length === 1"
            class="text-4xl font-semibold text-[#cff2da]"
          >
            {{ maintainer.projects[0].name }}
          </h2>

          <!-- Project Icons -->
          <div
            v-for="(project, idx) in maintainer.projects?.slice(0, 4)"
            :key="idx"
            class="w-24 h-24 flex items-center justify-center bg-[#eef0f1] outline outline-[#cff2da]"
          >
            <img
              v-if="project.logo"
              :src="project.logo"
              :alt="project.name"
              class="w-full h-full object-contain p-2"
            />
            <span v-else class="text-2xl font-bold text-[#18222a]">
              {{ project.name.charAt(0) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
