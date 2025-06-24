<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <div class="col-lg-8 offset-lg-2">
        <h1 class="mb-4">設定</h1>

        <!-- Appearance Section -->
        <h2 class="h4 mt-5 mb-3"><i class="bi bi-palette-fill me-2"></i>外觀</h2>
        <div class="card mb-4">
          <div class="card-body">
            <!-- Theme Mode -->
            <div class="mb-4">
              <label class="form-label fw-bold">主題模式</label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="theme" id="theme-light" autocomplete="off">
                <label class="btn btn-outline-primary w-100" for="theme-light"><i class="bi bi-sun-fill me-2"></i>淺色</label>
                
                <input type="radio" class="btn-check" name="theme" id="theme-dark" autocomplete="off" checked>
                <label class="btn btn-outline-primary w-100" for="theme-dark"><i class="bi bi-moon-stars-fill me-2"></i>深色</label>
                
                <input type="radio" class="btn-check" name="theme" id="theme-system" autocomplete="off">
                <label class="btn btn-outline-primary w-100" for="theme-system"><i class="bi bi-display-fill me-2"></i>跟隨系統</label>
              </div>
            </div>
            <!-- Font Size -->
            <div>
              <label class="form-label fw-bold">字體大小</label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="fontsize" id="fontsize-sm" autocomplete="off">
                <label class="btn btn-outline-secondary w-100" for="fontsize-sm">小</label>

                <input type="radio" class="btn-check" name="fontsize" id="fontsize-md" autocomplete="off" checked>
                <label class="btn btn-outline-secondary w-100" for="fontsize-md">中</label>

                <input type="radio" class="btn-check" name="fontsize" id="fontsize-lg" autocomplete="off">
                <label class="btn btn-outline-secondary w-100" for="fontsize-lg">大</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Display Section -->
        <h2 class="h4 mt-5 mb-3"><i class="bi bi-layout-text-sidebar-reverse me-2"></i>內容顯示</h2>
        <div class="card mb-4">
          <div class="card-body">
            <label for="words-per-page" class="form-label fw-bold">每頁單字數</label>
            <select id="words-per-page" class="form-select">
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <!-- Data Management Section -->
        <h2 class="h4 mt-5 mb-3"><i class="bi bi-hdd-stack-fill me-2"></i>資料管理</h2>
        <div class="list-group mb-4">
          <!-- Export -->
          <a href="#" @click.prevent="exportData" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-1 fw-bold">匯出資料</p>
              <small class="text-muted">將所有單字與標籤打包成 .json 備份檔。</small>
            </div>
            <i class="bi bi-chevron-right"></i>
          </a>
          <!-- Import -->
          <label for="import-file-input" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style="cursor: pointer;">
            <div>
              <p class="mb-1 fw-bold">匯入資料</p>
              <small class="text-muted">從 .json 備份檔還原，此操作會覆蓋現有資料。</small>
            </div>
            <i class="bi bi-chevron-right"></i>
          </label>
          <input id="import-file-input" type="file" class="d-none" accept=".json" @change="handleFileImport">
        </div>
        
        <!-- AI Helper Card -->
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title"><i class="bi bi-stars text-primary me-2"></i>AI 輔助建立單字庫</h5>
                <p class="card-text text-muted">使用AI快速分析文章並建立單字庫，複製下方指令即可開始。</p>
                
                <div class="d-grid gap-2">
                    <!-- FIX: Removed data-bs-* attributes and added a click handler -->
                    <button class="btn btn-outline-primary" type="button" @click="togglePrompt">
                        <i class="bi bi-lightbulb-fill me-2"></i>顯示/隱藏格式與指令範本
                    </button>
                </div>

                <!-- FIX: Added a ref to the collapsible element -->
                <div class="collapse" id="prompt-collapse" ref="collapseElement">
                    <div class="bg-light border rounded p-3 mt-3 position-relative">
                        <pre ref="promptText" style="white-space: pre-wrap; word-wrap: break-word; font-size: 0.875em;"><code>
# AI 指令 (可直接複製)

請幫我從下方的文章中，找出5個值得學習的英文單字。你需要：
1. 為每個單字提供繁體中文的定義。
2. 為每個單字加上1至3個相關的分類標籤 (例如：商業, 旅遊, 科技, 生活...)。
3. 將結果轉換成一個嚴格的 JSON 陣列格式。

**JSON 格式範本:**
```json
[
  {
    "text": "sustainability",
    "definition": "永續性；可持續性",
    "tags": ["商業", "環境"]
  },
  {
    "text": "algorithm",
    "definition": "演算法",
    "tags": ["科技"]
  }
]
```

---
請在這裡貼上你的文章：
[...在這裡貼上你的文章...]
---
</code></pre>
                        <button @click="copyPrompt" class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2" style="--bs-btn-padding-y: .1rem; --bs-btn-padding-x: .4rem; --bs-btn-font-size: .75rem;">
                            <i class="bi me-1" :class="copySuccess ? 'bi-check-lg text-success' : 'bi-clipboard-plus'"></i>
                            {{ copySuccess ? '已複製' : '複製' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reset Section -->
        <h2 class="h4 mt-5 mb-3 text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>危險區域</h2>
        <div class="list-group">
           <a href="#" @click.prevent="clearAllData" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-1 fw-bold text-danger">清空所有資料</p>
              <small class="text-muted">永久刪除所有單字與標籤，此操作無法復原。</small>
            </div>
            <i class="bi bi-chevron-right text-danger"></i>
          </a>
           <a href="#" @click.prevent="restoreDefaults" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-1 fw-bold text-danger">還原為預設資料</p>
              <small class="text-muted">清空您的個人資料，並重新載入應用程式內建的初始單字庫。</small>
            </div>
            <i class="bi bi-chevron-right text-danger"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import { Collapse } from 'bootstrap'; // FIX: Import Collapse module

const store = useStore();
const promptText = ref(null);
const copySuccess = ref(false);
const collapseElement = ref(null); // FIX: Create a ref for the collapse element
let collapseInstance = null; // FIX: Variable to hold the instance
const APP_VERSION = "1.0";

// --- Lifecycle Hooks to manage the Collapse instance ---
onMounted(() => {
    if (collapseElement.value) {
        // Initialize the collapse component, but don't toggle it on creation
        collapseInstance = new Collapse(collapseElement.value, {
            toggle: false
        });
    }
});

onUnmounted(() => {
    // Clean up the instance when the component is destroyed
    if (collapseInstance) {
        collapseInstance.dispose();
    }
});

// --- Toggling and Copying Functions ---
const togglePrompt = () => {
    if (collapseInstance) {
        collapseInstance.toggle();
    }
};

const copyPrompt = () => {
    const codeText = promptText.value?.querySelector('code')?.innerText;
    if (codeText) {
        navigator.clipboard.writeText(codeText)
        .then(() => {
            copySuccess.value = true;
            setTimeout(() => { copySuccess.value = false; }, 2000);
        })
        .catch(err => alert(`複製失敗: ${err}`));
    }
};

// --- Data Management Functions ---
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
    const date = new Date().toISOString().slice(0, 10);
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

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedJson = JSON.parse(e.target.result);
      let dataToProcess;

      if (importedJson.version && importedJson.data) {
        console.log('偵測到完整備份檔');
        dataToProcess = importedJson.data;
        if (confirm(`確定要從備份檔還原嗎？此操作將覆蓋所有現有資料。`)) {
            store.dispatch('replaceAllData', dataToProcess);
            alert("資料還原成功！");
        }
      } 
      else if (Array.isArray(importedJson)) {
        console.log('偵測到 AI 生成的單字列表');
        if (confirm(`即將從 AI 生成的檔案新增 ${importedJson.length} 個單字。這個操作不會刪除您現有的單字。要繼續嗎？`)) {
            processAndAddAiData(importedJson);
            alert("AI 單字新增成功！");
        }
      }
      else {
        throw new Error("無法辨識的檔案格式。");
      }
    } catch (error) {
      alert(`匯入失敗：${error.message}`);
      console.error(error);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
};

const processAndAddAiData = (words) => {
  const existingTags = new Map(store.state.tags.map(tag => [tag.name.toLowerCase(), tag]));
  const newTagsToAdd = [];
  const tagNameToIdMap = new Map(store.state.tags.map(tag => [tag.name, tag.id]));

  words.forEach(word => {
    if (!word.tags || !Array.isArray(word.tags)) return;
    word.tags.forEach(tagName => {
      const trimmedTagName = tagName.trim();
      if (trimmedTagName && !existingTags.has(trimmedTagName.toLowerCase())) {
        const newTag = { id: uuidv4(), name: trimmedTagName };
        newTagsToAdd.push(newTag);
        existingTags.set(newTag.name.toLowerCase(), newTag);
        tagNameToIdMap.set(newTag.name, newTag.id);
      }
    });
  });

  newTagsToAdd.forEach(tag => store.dispatch('addTag', { name: tag.name, id: tag.id }));

  words.forEach(word => {
    const wordToAdd = {
      text: word.text,
      definition: word.definition,
      tags: (word.tags || []).map(tagName => tagNameToIdMap.get(tagName.trim())).filter(Boolean)
    };
    store.dispatch('addWord', wordToAdd);
  });
};

// --- Reset Functions ---
const clearAllData = () => {
  if (confirm('警告！您確定要永久刪除所有單字和標籤嗎？此操作無法復原。')) {
    store.dispatch('clearAllData');
    alert('所有資料已清空。');
  }
};

const restoreDefaults = () => {
  if (confirm('確定要還原為初始資料嗎？這將會清除您目前所有的個人資料。')) {
    store.dispatch('restoreDefaults');
    alert('已成功還原為初始資料。');
  }
};
</script>

<style scoped>
h2.h4 {
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
    font-weight: 600;
}
pre {
    color: #495057;
}
.list-group-item {
    transition: background-color 0.15s ease-in-out;
}
</style>
