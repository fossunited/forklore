<script setup lang="ts">
const colorMode = useColorMode();
</script>
<template>
  <footer class="relative overflow-hidden">
    <!-- Beautiful Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20 dark:from-purple-800/30 dark:via-blue-800/20 dark:to-pink-800/30"></div>
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-40"></div>
    
    <!-- Floating Elements -->
    <div class="absolute top-8 right-12 text-2xl opacity-20 animate-bounce" style="animation-delay: 1s">💫</div>
    <div class="absolute bottom-12 left-8 text-xl opacity-15 animate-bounce" style="animation-delay: 3s">✨</div>

    <!-- Main Content -->
    <div class="relative z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-white/30 dark:border-gray-700/30">
      <div class="max-w-6xl mx-auto px-8 py-16">
        <!-- Header Section -->
        <div class="text-center mb-12">
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Thanks for visiting our slam book! 📚
          </h3>
          <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Keep the open source spirit alive by contributing to projects and sharing your stories with the community.
          </p>
        </div>

        <!-- Content Grid -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <!-- Built by Section -->
          <div class="group">
            <div class="relative p-6 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
              <div class="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/5 to-blue-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                    💝
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Built with Love</h4>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                  Crafted and maintained by the amazing team at
                  <a
                    href="https://fossunited.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group/link relative font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-300 ml-1"
                  >
                    FOSS United
                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover/link:w-full"></span>
                  </a>
                </p>
                <div class="flex items-center justify-center">
                  <div class="w-16 h-16 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center p-2"
                       :class="colorMode.value === 'light' ? 'bg-gray-800' : 'bg-gray-800'">
                    <img
                      class="w-full h-full object-contain"
                      src="/logo/fossunited_logo.svg"
                      alt="FOSS United Logo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connect Section -->
          <div class="group">
            <div class="relative p-6 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-green-400/5 to-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    🚀
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Get Involved</h4>
                </div>
                <div class="space-y-3">
                  <a
                    href="https://github.com/fossunited/forklore"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group/action flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all duration-300 hover:scale-105"
                  >
                    <div class="w-8 h-8 bg-gray-800 dark:bg-white rounded-lg flex items-center justify-center">
                      <IconsGithub class="w-5 h-5 text-white dark:text-gray-800" />
                    </div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Contribute on GitHub</span>
                    <svg class="w-4 h-4 text-gray-400 group-hover/action:text-gray-600 dark:group-hover/action:text-gray-200 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>

                  <a
                    href="https://forklore.in/rss"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group/action flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all duration-300 hover:scale-105"
                  >
                    <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <IconsRSS class="w-5 h-5 text-white" />
                    </div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Subscribe to RSS</span>
                    <svg class="w-4 h-4 text-gray-400 group-hover/action:text-gray-600 dark:group-hover/action:text-gray-200 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Section -->
          <div class="group">
            <div class="relative p-6 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
              <div class="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/5 to-blue-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                    💌
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Stay Connected</h4>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                  Have questions or want to share your story? We'd love to hear from you!
                </p>
                <a 
                  href="mailto:foundation@fossunited.org" 
                  class="group/email flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all duration-300 hover:scale-105"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <IconsEmailIcon class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="font-medium text-gray-700 dark:text-gray-300 block text-xs sm:text-sm">foundation@fossunited.org</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="border-t border-white/20 dark:border-gray-700/20 pt-8">
          <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <span class="text-red-500 animate-pulse">❤️</span>
              <span>for the open source community</span>
            </div>
            
            <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>© 2024 FOSS United</span>
              <span>•</span>
              <span class="inline-flex items-center space-x-1">
                <span>Powered by</span>
                <span class="text-green-600 dark:text-green-400 font-medium">Nuxt</span>
                <span>& community love</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Bottom Border -->
    <div class="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-60"></div>
  </footer>
</template>
