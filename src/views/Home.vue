<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h1 class="mb-0 w-100 text-start">單字列表</h1>
      <div class="ms-auto">
        <div class="d-flex flex-column align-items-center">
          <button class="btn btn-primary mt-2" @click="openModalForNew">
            <i class="bi bi-plus-circle-fill me-2"></i>新增單字
          </button>
        </div>
      </div>
    </div>

    <!-- Use the WordSearch component with v-model -->
    <!-- v-model="searchQuery" 會自動從 searchQuery.get 讀取，並在 WordSearch 內部 emit 'update:modelValue' 時呼叫 searchQuery.set -->
    <WordSearch v-model="searchQuery" class="mb-4" />


    <!-- Words List -->
    <div v-if="paginatedWords.length > 0" class="list-group">
      <div v-for="word in paginatedWords" :key="word.id" class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
        <div class="word-details">
          <!-- MODIFIED: Added a wrapper for the title and the new badge -->
          <div class="d-flex align-items-center mb-1">
            <h5 class="mb-0 me-3">{{ word.text }}</h5>
            <span
                class="badge rounded-pill fw-normal ms-auto"
              :class="getUnfamiliarityInfo(word.unfamiliarity).cssClass">
                {{ getUnfamiliarityInfo(word.unfamiliarity).text }}
            </span>
          </div>
          <p class="mb-1 text-secondary">{{ word.definition }}</p>
          <div v-if="word.tags && word.tags.length > 0" class="mt-2">
            <!-- MODIFIED: Changed <span> to <router-link> for actual tags -->
            <template v-for="tag in getDisplayTags(word.tags)" :key="tag.id || 'more-tags-indicator'">
              <router-link
                v-if="tag.name !== '...'"
                :to="{ path: '/', query: { keyword: `#${tag.name}`, page: 1 } }"
                class="badge rounded-pill me-1 tag-link"
                :class="getTagColorClass(tag.id)"
              >
                {{ tag.name }}
              </router-link>
              <span
                v-else
                class="badge rounded-pill me-1"
                :class="tag.name === '...' ? 'bg-secondary' : getTagColorClass(tag.id)"
              >
                {{ tag.name }}
              </span>
            </template>
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
      <!-- 顯示目前的 searchQuery 關鍵字 -->
      <p class="mb-0" v-if="searchQuery">找不到符合 "<b>{{ searchQuery }}</b>" 的單字。</p>
      <p class="mb-0" v-else>目前沒有任何單字，點擊「新增單字」來加入你的第一個單字吧！</p>
    </div>

    <!-- Pagination -->
    <nav v-if="totalPages > 1" aria-label="Word list pagination" class="mt-4">
      <ul class="pagination justify-content-center flex-wrap">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="currentPage = 1">首頁</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="prevPage">上一頁</a>
        </li>
        <li class="page-item" v-for="page in paginationPages" :key="page" :class="{ active: currentPage === page }">
          <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="nextPage">下一頁</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="currentPage = totalPages">末頁</a>
        </li>
      </ul>
    </nav>


    <!-- Word Editor Modal -->
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
import { ref, computed, watch, onMounted } from 'vue'; // 引入 onMounted
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import WordEditorModal from '../components/WordEditorModal.vue';
import WordSearch from '../components/WordSearch.vue'; // Corrected component name to PascalCase

const store = useStore();
const route = useRoute();
const router = useRouter();

const showModal = ref(false);
const editingWord = ref(null);

// --- 搜尋功能相關 (與 URL query 同步) ---
const searchQuery = computed({
  get() {
    return route.query.keyword || '';
  },
  set(newValue) {
    // 確保這裡的 router.push 只更新 URL，不直接觸發 Vuex 搜尋，
    // 因為 Vuex 搜尋會由 WordSearch 組件內部觸發，或在 Home 組件 onMounted 時觸發。
    // 這樣可以避免重複搜尋。
    router.push({
      query: {
        ...route.query,
        keyword: newValue || undefined,
        page: 1 // 執行新的搜尋時，將頁碼重設為第一頁
      }
    });
  }
});

// --- 分頁功能相關 (與 URL query 同步) ---
const currentPage = computed({
  get() {
    const page = parseInt(route.query.page || '1');
    return isNaN(page) || page < 1 ? 1 : page;
  },
  set(newPage) {
    router.push({
      query: {
        ...route.query,
        page: newPage
      }
    });
  }
});

const itemsPerPage = ref(10);
const pageRange = 5;

// 修改 words 為從 store.state.queryResult 獲取，而不是 store.state.words
const words = computed(() => store.state.queryResult); // 現在 paginatedWords 會基於搜尋結果

// 監聽搜尋結果 (words) 的變化。當搜尋結果改變時，自動重設頁碼為 1
// 由於 currentPage 現在是一個會更新 URL 的計算屬性，這裡會自動同步 URL
watch(words, () => {
  // 只有當當前頁碼不是 1 時才觸發更新，避免不必要的路由導航
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
}, { immediate: true }); // 在組件載入時立即執行一次

const totalPages = computed(() => {
  return Math.ceil(words.value.length / itemsPerPage.value);
});

const paginatedWords = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return words.value.slice(startIndex, endIndex);
});

const paginationPages = computed(() => {
  const pages = [];
  let startPage = Math.max(1, currentPage.value - Math.floor(pageRange / 2));
  let endPage = Math.min(totalPages.value, startPage + pageRange - 1);

  if (endPage - startPage + 1 < pageRange) {
    startPage = Math.max(1, endPage - pageRange + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  goToPage(currentPage.value - 1);
};

const nextPage = () => {
  goToPage(currentPage.value + 1);
};


// --- Helper for Unfamiliarity Badge ---
const getUnfamiliarityInfo = (unfamiliarityScore) => {
  const score = unfamiliarityScore || 0;

  if (score === 0) {
    return { cssClass: 'unfamiliarity-0', text: '已熟悉' };
  }
  if (score <= 3) {
    return { cssClass: 'unfamiliarity-low', text: `陌生度 ${score}` };
  }
  return { cssClass: 'unfamiliarity-high', text: `陌生度 ${score}` };
};

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
  // Replace window.confirm with a custom message for Canvas environment
  console.log(`嘗試刪除單字 ID: ${wordId}。在實際應用中，這裡會彈出一個確認對話框。`);
  // For a real application, you would implement a custom modal here
  // For now, we will proceed with deletion for demonstration purposes
  store.dispatch('deleteWord', wordId);
};

const allTags = computed(() => store.state.tags);

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

onMounted(() => {
  // 確保在組件掛載時，根據 URL 中的 keyword 觸發一次搜尋
  // 雖然 WordSearch 組件內也會觸發，但這裡再確保一下，以防萬一
  store.dispatch('performSearch', searchQuery.value);
});

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

/* --- Tag Colors --- */
.badge.tag-color-1 { background-color: #0d6efd; color: white; }
.badge.tag-color-2 { background-color: #198754; color: white; }
.badge.tag-color-3 { background-color: #6f42c1; color: white; }
.badge.tag-color-4 { background-color: #dc3545; color: white; }
.badge.tag-color-5 { background-color: #fd7e14; color: white; }
.badge.tag-color-6 { background-color: #6c757d; color: white; }

/* Styles for tag links */
.tag-link {
  text-decoration: none; /* Remove underline */
  color: inherit; /* Inherit text color from badge */
  cursor: pointer;
}

.tag-link:hover {
  opacity: 0.8; /* Slight opacity change on hover */
}


/* --- Unfamiliarity Badge Colors --- */
.badge.unfamiliarity-0 { background-color:rgb(217, 255, 236); color:rgb(73, 87, 75); border: 1px solid #dee2e6;}
.badge.unfamiliarity-low { background-color: #fff3cd; color: #664d03; border: 1px solid #ffecb5;}
.badge.unfamiliarity-high { background-color: #f8d7da; color: #842029; border: 1px solid #f5c2c7;}

/* --- Custom Pagination Styles --- */
.pagination {
  --bs-pagination-color: #6c757d; /* Adjust default link color */
  --bs-pagination-hover-color: #0d6efd; /* Adjust hover link color */
  --bs-pagination-focus-color: #0d6efd; /* Adjust focus link color */
  --bs-pagination-active-color: #000; /* Active link text color changed to black */
  --bs-pagination-active-bg: linear-gradient(45deg, #0d6efd, #0b5ed7); /* Active background gradient */
  --bs-pagination-active-border-color: #0d6efd; /* Active border color */
  --bs-pagination-disabled-color: #adb5bd; /* Disabled link color */
  --bs-pagination-disabled-bg: #e9ecef; /* Disabled background color */
  --bs-pagination-border-color: #dee2e6; /* Border color */
  --bs-pagination-hover-bg: #e9ecef; /* Hover background */
  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); /* Focus shadow */
}

.pagination .page-item .page-link {
  border-radius: 8px; /* More rounded corners for page links */
  margin: 0 4px; /* Space between page links */
  transition: all 0.3s ease; /* Smooth transitions for hover/focus */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Subtle shadow */
}

.pagination .page-item:first-child .page-link,
.pagination .page-item:last-child .page-link {
  border-radius: 8px; /* Apply rounded corners to first/last as well */
}

.pagination .page-item.active .page-link {
  font-weight: bold;
  color: var(--bs-pagination-active-color) !important; /* Explicitly ensure active text color is applied with !important */
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3); /* Stronger shadow for active page */
}

.pagination .page-item .page-link:hover {
  transform: translateY(-2px); /* Slight lift effect on hover */
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
  pointer-events: none; /* Disable click for disabled links */
  opacity: 0.7; /* Make disabled links slightly transparent */
  box-shadow: none; /* Remove shadow for disabled links */
}

</style>
