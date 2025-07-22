<template>
  <div class="relative min-h-screen">
    <!-- Beautiful Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-pink-900/10 dark:from-purple-800/20 dark:via-blue-800/10 dark:to-pink-800/20"></div>
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-20"></div>
    
    <!-- Floating Subtle Element -->
    <div class="absolute top-20 right-10 text-xl opacity-20 animate-bounce" style="animation-delay: 1s">✨</div>

    <!-- Content Grid -->
    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <!-- Projects Section -->
      <div class="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-r border-white/20 dark:border-gray-700/20">
        <div class="sticky top-0 bg-gradient-to-r from-purple-50/80 via-pink-50/40 to-blue-50/80 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-blue-900/30 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20 p-6">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <span class="text-purple-500">💻</span>
            <span>Code Stories</span>
          </h2>
        </div>
        <div class="p-6">
          <slot name="projects"></slot>
        </div>
      </div>

      <!-- Maintainer Section -->
      <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        <div class="sticky top-0 bg-gradient-to-r from-blue-50/80 via-green-50/40 to-purple-50/80 dark:from-blue-900/30 dark:via-green-900/20 dark:to-purple-900/30 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20 p-6">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <span class="text-pink-500">👤</span>
            <span>Personal Story</span>
          </h2>
        </div>
        <div class="p-6">
          <slot name="maintainer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
