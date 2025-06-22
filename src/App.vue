<template>
  <!-- 
    將整個應用程式包在一個 flex 容器中，
    並設定為 column 方向，讓頁尾可以被推到底部。
  -->
  <AppHeader /> 
  <div class="d-flex flex-column min-vh-100 spot">
    <!-- 導覽列放 在最上方 -->
    
    <!-- 
      使用 'main' 語意化標籤來包裝主要內容。
      'flex-grow-1' 會讓這個區塊自動伸展，填滿所有可用空間，
      將頁尾推向頁面底部。
    -->
    <main class="container mt-4 flex-grow-1">
      <router-view />
    </main>

    <!-- 我們可以預留一個頁尾的位置 -->
    <footer class="bg-light text-center text-lg-start mt-auto">
      <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.05);">
        © 2025 Copyright: 單字記憶工具
      </div>
    </footer>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';

export default {
  components: {
    AppHeader,
  },
};
</script>

<style scoped>
/* Scoped styles for App.vue can be added here if needed */
.spot{
	margin-left: auto;
	margin-right : auto;
	max-width : 1200px;
	top-margin : 60px;
}
</style>

