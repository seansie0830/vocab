<template>
  <div class="d-flex align-items-center">
    <!-- Export Button -->
    <button class="btn btn-outline-light me-2" @click="exportData">
      <i class="bi bi-box-arrow-up me-2"></i>匯出
    </button>

    <!-- Import Button (styled label for a hidden file input) -->
    <label for="import-file-input" class="btn btn-outline-light">
      <i class="bi bi-box-arrow-down me-2"></i>匯入
    </label>
    <input 
      id="import-file-input" 
      type="file" 
      class="d-none" 
      accept=".json"
      @change="importData"
    >
  </div>
</template>

<script setup>
import { useStore } from 'vuex';

const store = useStore();
const APP_VERSION = "1.0"; // 用於版本控制

/**
 * Handles the data export process.
 */
const exportData = () => {
  try {
    const dataToExport = {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      data: store.state
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    link.download = `vocab-backup-${date}.json`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("匯出失敗:", error);
    alert("資料匯出時發生錯誤！");
  }
};

/**
 * Handles the data import process.
 * @param {Event} event - The file input change event.
 */
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const importedJson = JSON.parse(e.target.result);

      // --- Data Validation ---
      if (!importedJson.version || !importedJson.data || !importedJson.data.words || !importedJson.data.tags) {
        throw new Error("檔案格式不符，缺少必要的資料結構。");
      }
      
      // We can add more specific version checks here in the future
      console.log(`正在匯入版本 ${importedJson.version} 的資料...`);

      // --- Confirmation ---
      const wordCount = importedJson.data.words.length;
      const tagCount = importedJson.data.tags.length;
      if (confirm(`確定要匯入這個檔案嗎？\n\n這將會覆蓋您目前所有的資料！\n檔案包含 ${wordCount} 個單字和 ${tagCount} 個標籤。`)) {
        store.dispatch('replaceAllData', importedJson.data);
        alert("資料匯入成功！");
      }

    } catch (error) {
      console.error("匯入失敗:", error);
      alert(`資料匯入時發生錯誤：\n${error.message}`);
    } finally {
      // Reset the input value to allow importing the same file again
      event.target.value = '';
    }
  };

  reader.onerror = (e) => {
      console.error("讀取檔案時發生錯誤:", e);
      alert("讀取檔案時發生錯誤！");
  };

  reader.readAsText(file);
};
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
