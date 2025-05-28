<script setup lang="ts">
import iconMapper from "~/utils/icons";

defineProps({
  variant: {
    type: String,
    required: true,
    default: "solid",
    validator: (value: string) =>
      ["solid", "subtle", "outline"].includes(value),
  },
  link: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: (props: { link: string }) => getPrettyLink(props.link),
  },
  preIcon: {
    type: String,
    default: null,
  },
  postIcon: {
    type: String,
    default: "arrow-up-right",
  },
});
</script>

<template>
  <a
    :class="`btn-${variant} text-sm flex items-center gap-2`"
    :href="link"
    target="_blank"
  >
    <slot name="pre-icon">
      <component
        v-if="preIcon"
        :is="iconMapper(preIcon)"
        class="w-5 h-5"
      ></component>
    </slot>
    <slot>
      {{ label }}
    </slot>
    <slot name="post-icon">
      <component
        v-if="postIcon"
        :is="iconMapper(postIcon)"
        class="w-5 h-5"
      ></component>
    </slot>
  </a>
</template>
