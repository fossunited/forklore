<template>
  <div class="grid grid-cols-1 md:grid-cols-2 divide-x-custom min-h-svh">
    <main aria-label="Projects">
      <slot name="projects"></slot>
    </main>
    <aside aria-label="Maintainer details">
      <slot name="maintainer"></slot>
    </aside>
  </div>
</template>
