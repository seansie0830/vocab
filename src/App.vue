<template>
  <AppHeader />
  <div class="d-flex flex-column min-vh-100">
    <main class="container mt-4 flex-grow-1 main-content">
      <router-view />
    </main>
  </div>
  <footer class="bg-light text-center text-lg-start mt-auto py-3">
    <div class="text-center p-3 full-width-footer" style="background-color: rgba(0, 0, 0, 0.05);">
      © 2025 Copyright: 單字記憶工具
    </div>
  </footer>

  <cmdPattle v-model:isOpen="isCommandPaletteOpen" />
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import cmdPattle from './components/cmdPattle.vue';

export default {
  components: {
    AppHeader,
    cmdPattle,
  },
  setup() {
    const isCommandPaletteOpen = ref(false);

    const handleGlobalKeyDown = (event) => {
      if (event.altKey && (event.key === 'p' || event.key === 'P')) {
        event.preventDefault();
        isCommandPaletteOpen.value = !isCommandPaletteOpen.value;
      }
      if (event.key === 'Escape') {
        isCommandPaletteOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleGlobalKeyDown);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    });

    return {
      isCommandPaletteOpen,
    };
  },
};
</script>

<style scoped>
.main-content {
  margin-left: auto;
  margin-right: auto;
  max-width: 960px; /* Keep content centered and constrained */
  padding-top: 60px; /* Adjust for fixed header height */
}

.full-width-footer {
  width: 100%;
}
</style>
