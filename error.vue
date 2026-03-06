<script lang="ts" setup>
import BaseLayout from "@/layout/BaseLayout.vue";
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

useHead({
  title: `${props.error.statusCode} - Forklore`,
  meta: [
    { name: "description", content: "Page not found" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const getErrorMessage = (statusCode: number) => {
  const messages: Record<number, string> = {
    404: "Page not found",
    500: "Internal server error",
    403: "Forbidden",
    401: "Unauthorized",
  };
  return messages[statusCode] || "Something went wrong";
};

const getAsciiArt = (statusCode: number) => {
  const art: Record<number, string> = {
    404: ` _  _    ___  _  _  
| || |  / _ \\| || | 
| || |_| | | | || |_
 |__   _| |_| |__   _|
   |_|  \\___/   |_| `,
    500: ` ____   ___   ___  
| ___| / _ \\ / _ \\ 
|___ \\| | | | | | |
 ___) | |_| | |_| |
|____/ \\___/ \\___/ `,
    403: " _  _    ___  _____ \n| || |  / _ \\|___ / \n| || |_| | | | |_ \\ \n|__   _| |_| |___) |\n   |_|  \\___/|____/ ",
    401: " _  _    ___  _ \n| || |  / _ \\/ |\n| || |_| | | | |\n|__   _| |_| | |\n   |_|  \\___/|_|",
  };
  return art[statusCode] || statusCode.toString();
};
</script>

<template>
  <BaseLayout>
    <div class="flex items-center justify-center min-h-screen px-4 py-0">
      <div class="flex flex-col items-center gap-6 max-w-2xl w-full">
        <!-- ASCII art error code -->
        <pre class="text-xl lg:text-2xl leading-tight text-center opacity-90">{{
          getAsciiArt(error.statusCode!)
        }}</pre>

        <!-- Error message -->
        <h1 class="text-2xl md:text-3xl font-medium text-center">
          {{ getErrorMessage(error.statusCode!) }}
        </h1>
        <p
          v-if="error.statusText"
          class="text-base opacity-70 max-w-md text-center"
        >
          {{ error.statusText }}
        </p>

        <NuxtLink to="/" class="btn-solid"> <- Go back home </NuxtLink>
      </div>
    </div>
  </BaseLayout>
</template>
