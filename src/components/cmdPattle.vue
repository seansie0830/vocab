<template>
  <div
    v-if="isOpen"
    class="modal d-flex justify-content-center align-items-center show"
    style="display: block; background-color: rgba(0, 0, 0, 0.5);"
    tabindex="-1"
    aria-labelledby="commandPaletteLabel"
    aria-hidden="true"
  >
    <div
      ref="paletteRef"
      class="modal-dialog modal-dialog-centered custom-modal-width"
      role="document"
    >
      <div class="modal-content shadow-lg rounded-4 overflow-hidden animate__animated animate__fadeInUp">
        <div class="modal-header border-bottom-0 pb-0">
          <input
            type="text"
            placeholder="搜尋你的命令..."
            class="form-control form-control-lg border-0 rounded-0 focus-ring"
            autofocus
            v-model="internalSearchQuery"
          />
          <button type="button" class="btn-close d-none" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body p-2" style="max-height: 320px; overflow-y: auto;">
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">我的設定</span>
            <span class="text-sm text-secondary-emphasis">Ctrl+S</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">開啟設定</span>
            <span class="text-sm text-secondary-emphasis">Ctrl+,</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">新增單字</span>
            <span class="text-sm text-secondary-emphasis">N</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">開始測驗</span>
            <span class="text-sm text-secondary-emphasis">Q</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">匯出資料</span>
            <span class="text-sm text-secondary-emphasis">E</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">切換主題</span>
            <span class="text-sm text-secondary-emphasis">T</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">顯示所有單字</span>
            <span class="text-sm text-secondary-emphasis"></span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">關於</span>
            <span class="text-sm text-secondary-emphasis"></span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-3 rounded-2 cursor-pointer transition-colors hover-bg-primary-subtle">
            <span class="fw-medium text-dark">幫助</span>
            <span class="text-sm text-secondary-emphasis"></span>
          </div>
          <div class="text-center text-secondary p-3">
            <!-- 這裡預留一個顯示沒有結果的空間，但目前是靜態列表，所以不會出現 -->
          </div>
        </div>

        <div class="modal-footer border-top-0 pt-0 text-center text-secondary-emphasis small">
          按下 <kbd class="px-1 py-0 bg-light-subtle rounded-1">Esc</kbd> 關閉面板
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 1. 定義 props，以便父元件 (App.vue) 可以透過 v-model:isOpen 來傳遞 isOpen 狀態
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

// 2. 定義 emit 事件，以便子元件在需要改變 isOpen 狀態時通知父元件
const emit = defineEmits(['update:isOpen']);

// 3. 新增一個用於 input 的內部 ref，解決 "Failed to resolve directive: model" 警告
const internalSearchQuery = ref('');

// paletteRef 仍然用於未來點擊外部關閉的邏輯
const paletteRef = ref(null);

// 注意：所有鍵盤事件監聽、搜尋邏輯、命令執行邏輯都已移除
// 現在 cmdPattle.vue 的顯示完全依賴於 props.isOpen 的值
</script>

<style scoped>
/* Bootstrap 5 已經包含了許多預設樣式，但我們可以添加一些自訂樣式來微調 */

/* 模態框動畫 */
.animate__animated {
  animation-duration: 0.3s;
}

/* 輸入框聚焦時的藍色光環，類似 Tailwind 的 focus:ring */
.form-control.focus-ring:focus {
  border-color: var(--bs-primary); /* 使用 Bootstrap 的主要顏色 */
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
  outline: 0;
}

/* 命令項目的過渡效果 */
.transition-colors {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.cursor-pointer {
  cursor: pointer;
}

/* 自定義 hover 效果，因為 Bootstrap 沒有直接對應的 hover:bg-blue-50 */
.hover-bg-primary-subtle:hover {
  background-color: var(--bs-primary-bg-subtle, var(--bs-blue-100)); /* 使用 Bootstrap 的 primary-subtle 或 fallback */
  color: var(--bs-primary); /* 如果需要，hover 時文字也變色 */
}

/* 自定義一些字體大小 */
.text-3xl {
    font-size: 1.875rem; /* 30px */
    line-height: 2.25rem; /* 36px */
}
.text-sm {
    font-size: 0.875rem; /* 14px */
    line-height: 1.25rem; /* 20px */
}

/*
  修正模態框寬度：
  1. 移除 modal-dialog 上的 .widthSet class，因為我們會直接在 .custom-modal-width 中處理響應式寬度。
  2. 調整 .custom-modal-width 樣式，使其在不同螢幕尺寸下有更合適的 max-width。
*/
.custom-modal-width {
    max-width: 90%; /* 預設在小螢幕上佔據大部分寬度 */
    width: 100%; /* 確保它能使用其最大寬度 */
}

@media (min-width: 576px) { /* Small devices (landscape phones, 576px and up) */
    .custom-modal-width {
        max-width: 500px; /* 在小螢幕上設定一個固定最大寬度 */
    }
}

@media (min-width: 768px) { /* Medium devices (tablets, 768px and up) */
    .custom-modal-width {
        max-width: 700px; /* 在中等螢幕上設定更寬的最大寬度 */
    }
}

@media (min-width: 992px) { /* Large devices (desktops, 992px and up) */
    .custom-modal-width {
        max-width: 900px; /* 在大螢幕上設定更大的最大寬度 */
    }
}

@media (min-width: 1200px) { /* Extra large devices (large desktops, 1200px and up) */
    .custom-modal-width {
        max-width: 1000px; /* 在特大螢幕及以上設定為 1000px */
    }
}

/* 自定義捲軸樣式 */
/* 適用於 WebKit 瀏覽器 (Chrome, Safari, Edge) */
.modal-body::-webkit-scrollbar {
  width: 8px; /* 捲軸的寬度 */
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1; /* 捲軸軌道的背景色 (淺灰色) */
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c0c0c0; /* 捲軸拉動條的顏色 (中淺灰色) */
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8; /* 捲軸拉動條 hover 時的顏色 */
}
</style>
