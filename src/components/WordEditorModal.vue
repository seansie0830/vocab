<template>
  <div class="modal fade" ref="modalElement" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ formTitle }}</h5>
          <button type="button" class="btn-close" @click="close" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="word-editor-form" @submit.prevent="submitForm">
            <!-- Word Text & Definition -->
            <div class="mb-3">
              <label for="wordText" class="form-label">單字</label>
              <input type="text" class="form-control" id="wordText" v-model="editableWord.text" required>
            </div>
            <div class="mb-3">
              <label for="wordDefinition" class="form-label">定義</label>
              <textarea class="form-control" id="wordDefinition" rows="3" v-model="editableWord.definition" required></textarea>
            </div>
            
            <hr class="my-4">

            <!-- Tag Management Section -->
            <h6>管理與選取標籤</h6>

            <!-- DEFINITIVE FIX 2: Replaced dropdown with a simple toggle button -->
            <div class="input-group mb-3">
              <input 
                type="text" 
                class="form-control" 
                v-model="tagSearchQuery" 
                @keydown.enter.prevent="handleEnterKey"
                :placeholder="tagMode === 'manage' ? '搜尋已選取的標籤...' : '搜尋或輸入新標籤...'">
              
              <button 
                class="btn btn-outline-secondary d-flex align-items-center" 
                type="button" 
                @click="toggleTagMode"
                title="點擊切換模式">
                <span v-if="tagMode === 'manage'">
                  <i class="bi bi-list-check"></i><span class="ms-2">改</span>
                </span>
                <span v-else>
                  <i class="bi bi-plus-lg"></i><span class="ms-2">增</span>
                </span>
              </button>
            </div>

            <!-- Tag List Container -->
            <div 
              class="tag-list-container border rounded p-2" 
              style="max-height: 200px; overflow-y: auto; scrollbar-color: #dee2e6 #f8f9fa; scrollbar-width: thin;"
            >
              <div v-if="tagMode === 'add'">
              <!-- MODIFICATION: "Create new" suggestion is now always visible in 'add' mode when there is text -->
              <div v-if="showCreateSuggestion" class="suggestion-item" @click="handleAddNewTag">
                <i class="bi bi-plus-circle me-2"></i>
                <span>建立新標籤: "<b>{{ tagSearchQuery.trim() }}</b>"</span>
              </div>
              <div v-for="tag in filteredAvailableTags" :key="tag.id" class="d-flex justify-content-between align-items-center form-check py-1 hover-highlight">
                <div>
                <input class="form-check-input" type="checkbox" :id="`tag-add-${tag.id}`" :value="tag.id" v-model="editableWord.tags">
                <label class="form-check-label ms-2" :for="`tag-add-${tag.id}`">{{ tag.name }}</label>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" @click.stop.prevent="handleDeleteTag(tag.id)">
                <i class="bi bi-trash"></i>
                </button>
              </div>
              <div v-if="filteredAvailableTags.length === 0 && !showCreateSuggestion" class="text-muted text-center p-3">
                <p>沒有可新增的標籤。</p>
              </div>
              </div>

              <div v-if="tagMode === 'manage'">
                <div v-for="tag in filteredSelectedTags" :key="tag.id" class="form-check py-1">
                  <input class="form-check-input" type="checkbox" :id="`tag-manage-${tag.id}`" :value="tag.id" v-model="editableWord.tags" checked>
                  <label class="form-check-label ms-2" :for="`tag-manage-${tag.id}`">{{ tag.name }}</label>
                </div>
                <div v-if="filteredSelectedTags.length === 0" class="text-muted text-center p-3">
                  <p>尚未選取任何標籤。</p>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">取消</button>
          <button type="submit" class="btn btn-primary" form="word-editor-form">儲存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { Modal } from 'bootstrap';

const props = defineProps({ show: Boolean, word: Object });
const emit = defineEmits(['close', 'save']);
const store = useStore();

const modalElement = ref(null);
const editableWord = ref({ tags: [] });

let modalInstance = null;

const tagSearchQuery = ref('');
const tagMode = ref('manage');

const formTitle = computed(() => (props.word && props.word.id) ? '編輯單字' : '新增單字');
const allTags = computed(() => [...store.state.tags].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')));

// --- Computed Properties for Dual-Mode ---
const selectedTagsList = computed(() => {
  const selectedIds = new Set(editableWord.value.tags || []);
  return allTags.value.filter(tag => selectedIds.has(tag.id));
});

const availableTagsList = computed(() => {
  const selectedIds = new Set(editableWord.value.tags || []);
  return allTags.value.filter(tag => !selectedIds.has(tag.id));
});

const filteredSelectedTags = computed(() => {
  const query = tagSearchQuery.value.trim().toLowerCase();
  if (!query) return selectedTagsList.value;
  return selectedTagsList.value.filter(tag => tag.name.toLowerCase().includes(query));
});

const filteredAvailableTags = computed(() => {
  const query = tagSearchQuery.value.trim().toLowerCase();
  if (!query) return availableTagsList.value;
  return availableTagsList.value.filter(tag => tag.name.toLowerCase().includes(query));
});

// MODIFICATION: Show suggestion whenever there is text in 'add' mode.
const showCreateSuggestion = computed(() => {
  const query = tagSearchQuery.value.trim();
  return query && tagMode.value === 'add';
});


// --- Methods ---
const toggleTagMode = () => {
  tagMode.value = tagMode.value === 'manage' ? 'add' : 'manage';
  tagSearchQuery.value = '';
};

const setTagMode = (mode) => { 
  tagMode.value = mode;
  tagSearchQuery.value = '';
};

const close = () => modalInstance?.hide();

const submitForm = () => {
  if (!editableWord.value.text?.trim() || !editableWord.value.definition?.trim()) {
    alert('「單字」和「定義」為必填欄位！');
    return;
  }
  emit('save', editableWord.value);
};

// MODIFICATION: Handle duplicate check directly within the function.
const handleAddNewTag = () => {
  const tagName = tagSearchQuery.value.trim();
  if (!tagName) return;

  const isDuplicate = allTags.value.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
  if (isDuplicate) {
    alert(`標籤 "${tagName}" 已經存在！`);
    return;
  }

  store.dispatch('addTag', tagName).then(newTag => {
    if (newTag?.id) {
       editableWord.value.tags = [...(editableWord.value.tags || []), newTag.id];
    }
    tagSearchQuery.value = '';
  });
};

const handleDeleteTag = (tagId) => {
  const tag = allTags.value.find(t => t.id === tagId);
  if (tag && confirm(`確定要從系統中永久刪除標籤 "${tag.name}" 嗎？此操作無法復原。`)) {
    store.dispatch('deleteTag', tagId);
  }
};

const handleEnterKey = () => {
  // Only try to add if the suggestion is visible (i.e., in 'add' mode with text)
  if (showCreateSuggestion.value) {
    handleAddNewTag();
  }
};

// --- Lifecycle & Watchers ---
onMounted(() => {
  nextTick(() => {
    if (modalElement.value) {
      modalInstance = new Modal(modalElement.value, { keyboard: false, backdrop: 'static' });
      modalElement.value.addEventListener('hidden.bs.modal', () => emit('close'));
    }

    if (props.show) {
      modalInstance?.show();
    }
  });
});

onUnmounted(() => {
  modalInstance?.dispose();
  modalInstance = null;
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Set default mode when opening
    tagMode.value = (props.word?.tags?.length > 0) ? 'manage' : 'add';
    tagSearchQuery.value = '';
    modalInstance?.show();
  } else {
    modalInstance?.hide();
  }
});

watch(() => props.word, (newWord) => {
  editableWord.value = JSON.parse(JSON.stringify(newWord || { text: '', definition: '', tags: [] }));
  if (!editableWord.value.tags) {
    editableWord.value.tags = [];
  }
}, { immediate: true, deep: true });

</script>

<style scoped>
.tag-list-container {
  background-color: #fdfdff;
}
.hover-highlight:hover {
  background-color: #e9ecef;
}
.suggestion-item {
  cursor: pointer;
  color: #0d6efd;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease-in-out;
  padding: .5rem; 
}
.suggestion-item:hover {
  background-color: #e7f1ff;
}
</style>
