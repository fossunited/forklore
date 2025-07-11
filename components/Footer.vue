<template>
  <div
    class="bg-secondary-light dark:bg-primary-dark text-primary-light dark:text-secondary-dark border-t-2 w-full place-items-center flex flex-col items-center"
  >
    <div class="max-w-screen-md w-full py-14 px-4 flex justify-between text-sm">
      <div class="flex flex-col gap-4">
        <p>
          Built and Maintained by
          <a
            href="https://fossunited.org"
            target="_blank"
            class="font-bold link"
          >
            FOSS United
          </a>
        </p>
        <a
          class="flex text-sm gap-2 items-center btn-subtle w-fit"
          href="https://github.com/fossunited/forklore"
          target="_blank"
        >
          <IconsGithub class="w-5 h-5" />
          Contribute
        </a>

        <a
          class="flex text-sm gap-2 items-center btn-subtle w-fit"
          href="https://forklore.in/rss"
          target="_blank"
        >
          <IconsRSS class="w-5 h-5" />
          RSS
        </a>

        <a href="mailto:foundation@fossunited.org" class="link flex gap-2">
          <IconsEmailIcon class="w-5 h-5" />
          <span> foundation@fossunited.org </span>
        </a>
      </div>
      <img
        class="w-12"
        src="/logo/fossunited_logo.svg"
        alt="FOSS United Logo"
      />
    </div>
  </div>
</template>
