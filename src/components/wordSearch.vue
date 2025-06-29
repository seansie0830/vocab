<template>
  <div class="input-group">
    <span class="input-group-text" id="search-addon"><i class="bi bi-search"></i></span>
    <input
      type="text"
      class="form-control custom-search-input"
      placeholder="搜尋單字或定義..."
      :value="modelValue"
      @input="handleInput"
      aria-label="Search"
      aria-describedby="search-addon"
    >
  </div>
</template>
<style lang="css">
.input-group {
  display: flex;
  align-items: center;
  /* 移除 gap，讓 input-group-text 和 custom-search-input 緊密相連 */
  /* gap: 0.5rem; */
  background: #fff; /* 整個外框保持白色背景 */
  border-radius: 1.5rem; /* 整個外框保持圓角 */
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 0.5rem 1rem; /* 整個外框的內邊距 */
  width: 100%;
  max-width: none;
  margin: 0;
  box-sizing: border-box;
}

.input-group-text {
  background: transparent; /* 搜尋圖標背景透明 */
  border: none;
  padding: 0; /* 移除內邊距，或根據需要調整 */
  font-size: 1.5rem;
  color: #888;
  display: flex;
  align-items: center;
  /* 確保與 input 框之間沒有額外間距 */
  margin-right: 0.5rem; /* 為了美觀，可以在這裡給圖標右側加一點間距 */
}

.custom-search-input {
  border: none;
  outline: none;
  background: #f8f8f8; /* **這裡！** 將淺灰色背景應用到輸入框本身 */
  font-size: 1.25rem;
  padding: 0.75rem 1rem; /* 輸入框內部文字的內邊距 */
  flex: 1;
  color: #222;
  /* 重新設定圓角，只讓右邊圓角，左邊保持直線 */
  border-top-right-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  border-top-left-radius: 0; /* 左上角直角 */
  border-bottom-left-radius: 0; /* 左下角直角 */
  transition: box-shadow 0.2s;
  display: block;
  width: 100%;
  min-width: 0;
  /* 由於父級 input-group 有 padding，這裡可以考慮調整 padding-left/right */
  margin-left: -1rem; /* 向左負邊距，抵消 input-group 的 padding-left，讓淺灰底延伸到左邊緣 */
  padding-left: 1rem; /* 恢復輸入框內文字的左內邊距 */
}

/* 確保焦點時沒有邊框或陰影，且背景色不變 */
.custom-search-input:focus {
  outline: none;
  box-shadow: none;
  background: #f8f8f8; /* 保持淺灰底 */
}

/* 如果有使用 Bootstrap，可能需要覆蓋其預設焦點樣式 */
.form-control:focus {
  box-shadow: none !important;
  border-color: initial !important;
}

::placeholder {
  color: #bbb;
  opacity: 1;
}
</style>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { debounce } from 'lodash'; // 引入 lodash 的 debounce 函數

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const store = useStore();

// 內部搜尋關鍵字，用於 debounce
const internalSearchQuery = ref(props.modelValue);

// 延遲執行搜尋的函數
const debouncedPerformSearch = debounce((keyword) => {
  store.dispatch('performSearch', keyword);
}, 300); // 延遲 300 毫秒

// 處理輸入事件
const handleInput = (event) => {
  const newValue = event.target.value;
  internalSearchQuery.value = newValue; // 更新內部狀態
  emit('update:modelValue', newValue); // 向上層組件同步更新 v-model
  debouncedPerformSearch(newValue); // 觸發延遲搜尋
};

// 監聽 modelValue 的變化 (來自 Home.vue 的 URL 更新)
watch(() => props.modelValue, (newVal) => {
  if (internalSearchQuery.value !== newVal) {
    internalSearchQuery.value = newVal;
    // 如果是外部更新 (例如 URL 改變)，也執行搜尋
    debouncedPerformSearch(newVal);
  }
}, { immediate: true }); // 在組件載入時立即執行一次

// 組件掛載時，確保執行一次搜尋 (處理初始載入的 URL 關鍵字)
onMounted(() => {
  debouncedPerformSearch(props.modelValue);
});
</script>
