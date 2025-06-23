<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h2 class="mb-0">單字列表</h2>
      <button class="btn btn-primary" @click="openModalForNew">
        <i class="bi bi-plus-circle-fill me-2"></i>新增單字
      </button>
    </div>

    <WordSearch v-model="searchQuery" class="mb-4" />


    <div v-if="filteredWords.length > 0" class="list-group">
      <div v-for="word in filteredWords" :key="word.id" class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
        <div class="word-details">
          <h5 class="mb-1">{{ word.text }}</h5>
          <p class="mb-1 text-secondary">{{ word.definition }}</p>
          <div v-if="word.tags && word.tags.length > 0" class="mt-2">
            <span v-for="tag in getDisplayTags(word.tags)" :key="tag.id || 'more-tags-indicator'" 
                  class="badge rounded-pill me-1"
                  :class="tag.name === '...' ? 'bg-secondary' : getTagColorClass(tag.id)">
              {{ tag.name }}
            </span>
          </div>
        </div>
        <div class="word-actions mt-2 mt-md-0">
          <button class="btn btn-sm btn-outline-secondary me-2" @click="openModalForEdit(word)">
            <i class="bi bi-pencil-fill"></i> 編輯
          </button>
          <button class="btn btn-sm btn-outline-danger" @click="handleDelete(word.id)">
            <i class="bi bi-trash-fill"></i> 刪除
          </button>
        </div>
      </div>
    </div>
    <div v-else class="alert alert-warning" role="alert">
      <p class="mb-0" v-if="searchQuery">找不到符合 "<b>{{ searchQuery }}</b>" 的單字。</p>
      <p class="mb-0" v-else>目前沒有任何單字，點擊「新增單字」來加入你的第一個單字吧！</p>
    </div>

    <WordEditorModal 
      v-if="showModal"
      :show="showModal" 
      :word="editingWord" 
      @close="closeModal" 
      @save="handleSave" 
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import WordEditorModal from '../components/WordEditorModal.vue';
import WordSearch from '../components/wordSearch.vue';

const store = useStore();

const showModal = ref(false);
const editingWord = ref(null);
const searchQuery = ref('');

const words = computed(() => store.state.words);
const allTags = computed(() => store.state.tags);

const filteredWords = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return words.value;
  }
  return words.value.filter(word => 
    word.text.toLowerCase().includes(query) || 
    word.definition.toLowerCase().includes(query)
  );
});

// The handleSearch function is no longer needed because of v-model
// const handleSearch = (newQuery) => { ... };

const openModalForNew = () => {
  editingWord.value = null;
  showModal.value = true;
};

const openModalForEdit = (word) => {
  editingWord.value = JSON.parse(JSON.stringify(word));
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingWord.value = null;
};

const handleSave = (wordData) => {
  if (wordData.id) {
    store.dispatch('updateWord', wordData);
  } else {
    store.dispatch('addWord', wordData);
  }
  closeModal();
};

const handleDelete = (wordId) => {
  if (confirm('確定要刪除這個單字嗎？')) {
    store.dispatch('deleteWord', wordId);
  }
};

const tagColorClasses = [
  'tag-color-1', 'tag-color-2', 'tag-color-3', 'tag-color-4', 'tag-color-5', 'tag-color-6'
];

const getTagColorClass = (tagId) => {
  if (!tagId) return 'bg-secondary';

  const tagIndex = store.state.tags.findIndex(tag => tag.id === tagId);

  if (tagIndex === -1) {
    return 'bg-secondary';
  }
  
  const colorIndex = tagIndex % tagColorClasses.length;
  return tagColorClasses[colorIndex];
};

const getDisplayTags = (tagIds) => {
  if (!tagIds || tagIds.length === 0) return [];
  
  const tags = tagIds
    .map(tagId => allTags.value.find(tag => tag.id === tagId))
    .filter(Boolean);
  
  const TAG_LIMIT = 5;
  if (tags.length > TAG_LIMIT) {
    const limitedTags = tags.slice(0, TAG_LIMIT);
    return [...limitedTags, { id: null, name: '...' }];
  }
  
  return tags;
};

</script>

<style scoped>
.word-details {
  flex-grow: 1;
  min-width: 70%;
  padding-right: 1rem;
}
.word-actions {
  flex-shrink: 0;
  white-space: nowrap;
}

@media (max-width: 767px) {
    .list-group-item {
        flex-direction: column;
        align-items: flex-start !important;
    }
    .word-actions {
        width: 100%;
        text-align: right;
        margin-top: 1rem;
    }
}

.badge.tag-color-1 { background-color: #0d6efd; color: white; }
.badge.tag-color-2 { background-color: #198754; color: white; }
.badge.tag-color-3 { background-color: #6f42c1; color: white; }
.badge.tag-color-4 { background-color: #dc3545; color: white; }
.badge.tag-color-5 { background-color: #fd7e14; color: white; }
.badge.tag-color-6 { background-color: #6c757d; color: white; }
</style>

