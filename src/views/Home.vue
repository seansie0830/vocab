<template>
  <!-- 使用 Bootstrap 的 Grid 系統來建立一個更具質感的佈局 -->
  <div class="row justify-content-center">
    <div class="col-md-10 col-lg-8">
      
      <WordSearch v-model="searchTerm" />

      <h2 class="mb-4">單字列表</h2>
      
      <div v-if="filteredWords.length === 0" class="alert alert-info shadow-sm">
        找不到符合條件的單字。
      </div>

      <div v-else class="list-group shadow-sm">
        <div v-for="word in filteredWords" :key="word.id" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">{{ word.term }}</h5>
            <p class="mb-1">{{ word.definition }}</p>
            <!-- 為每個單字顯示其對應的標籤 -->
            <div class="mt-2">
              <span 
                v-for="tagId in word.tagIds.slice(0, TAG_DISPLAY_LIMIT)" 
                :key="tagId" 
                class="badge rounded-pill me-1" 
                :style="{ backgroundColor: getTagColor(tagId), color: '#fff' }"
              >
                {{ getTagName(tagId) }}
              </span>
              <span v-if="word.tagIds.length > TAG_DISPLAY_LIMIT" class="badge rounded-pill bg-secondary">
                +{{ word.tagIds.length - TAG_DISPLAY_LIMIT }} 更多
              </span>
            </div>
            <small class="text-muted mt-2 d-block">備註: {{ word.notes || '無' }}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary me-2">編輯</button>
            <!-- 更新：為刪除按鈕加上 click 事件處理 -->
            <button class="btn btn-sm btn-outline-danger" @click="deleteWord(word.id)">刪除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import WordSearch from '../components/WordSearch.vue';

export default {
  name: 'HomePage',
  components: {
    WordSearch,
  },
  setup() {
    const store = useStore();
    const searchTerm = ref('');
    const TAG_DISPLAY_LIMIT = 3;

    const filteredWords = computed(() => {
      const term = searchTerm.value.trim();
      if (!term) return store.state.words;
      if (term.startsWith('#')) {
        const tagName = term.substring(1).toLowerCase();
        if (!tagName) return store.state.words;
        const tag = Object.values(store.state.tags).find(t => t.name.toLowerCase() === tagName);
        if (!tag) return [];
        return store.state.words.filter(word => word.tagIds && word.tagIds.includes(tag.id));
      } else {
        const lowerCaseSearchTerm = term.toLowerCase();
        return store.state.words.filter(word => 
          word.term.toLowerCase().includes(lowerCaseSearchTerm) || 
          word.definition.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
    });

    const getTagName = (tagId) => store.state.tags[tagId]?.name || '未知標籤';
    const getTagColor = (tagId) => store.state.tags[tagId]?.color || '#6c757d';

    // 新增：刪除單字的方法
    const deleteWord = (wordId) => {
      // 在真實的應用中，這裡應該會顯示一個更美觀的確認對話框
      // 但為了簡單起見，我們先使用瀏覽器內建的 confirm
      if (window.confirm('您確定要刪除這個單字嗎？')) {
        store.commit('DELETE_WORD', wordId);
      }
    };

    return {
      searchTerm,
      filteredWords,
      getTagName,
      getTagColor,
      TAG_DISPLAY_LIMIT,
      deleteWord, // 將方法回傳給模板使用
    };
  },
};
</script>

<style scoped>
.list-group-item h5 {
  font-weight: 500;
}
</style>

