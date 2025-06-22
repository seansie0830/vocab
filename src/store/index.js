import { createStore } from 'vuex';
import storage from '../services/storage';

export const storeConfig = {
  state: {
    // --- 標籤定義區 ---
    tags: {
      "tag-1": { "id": "tag-1", "name": "多益核心", "color": "#4287f5" },
      "tag-2": { "id": "tag-2", "name": "英檢中級", "color": "#f542a4" },
      "tag-3": { "id": "tag-3", "name": "學術單字", "color": "#20c997" },
      "tag-4": { "id": "tag-4", "name": "程式設計", "color": "#fd7e14" },
      "tag-5": { "id": "tag-5", "name": "生活常用", "color": "#6f42c1" },
    },
    
    // --- 單字主資料庫 ---
    words: [
      {
        "id": "word-1667826859456",
        "term": "ubiquitous",
        "definition": "無所不在的",
        "tagIds": ["tag-1", "tag-2", "tag-5"],
        "familiarityScore": 0,
        "lastTestedAt": null,
        "correctStreak": 0,
        "notes": "來自電影《駭客任務》"
      },
      {
        "id": "word-1667826859457",
        "term": "photosynthesis",
        "definition": "光合作用",
        "tagIds": ["tag-3"],
        "familiarityScore": 2,
        "lastTestedAt": "2025-06-20T10:00:00Z",
        "correctStreak": 3,
        "notes": "生物學單字"
      },
      // 新增：一個擁有多個標籤的單字，用來測試省略功能
      {
        "id": "word-1750610000000",
        "term": "polymorphism",
        "definition": "多型",
        "tagIds": ["tag-1", "tag-2", "tag-3", "tag-4", "tag-5"],
        "familiarityScore": 4,
        "lastTestedAt": "2025-06-21T14:00:00Z",
        "correctStreak": 8,
        "notes": "物件導向程式設計的重要觀念"
      }
    ],

    // --- 當前考卷資料 ---
    currentQuiz: {
      words: [],
      createdAt: null,
      settings: {}
    }
  },
  mutations: {
    SET_WORDS(state, wordList) {
      state.words = wordList;
    },
    ADD_WORD(state, word) {
      const newWord = word || { 
        id: `word-${Date.now()}`, 
        term: 'test word', 
        definition: '測試單字', 
        tagIds: [], 
        familiarityScore: 0, 
        lastTestedAt: null, 
        correctStreak: 0, 
        notes: 'Manually added for testing'
      };
      state.words.push(newWord);
    },
    UPDATE_WORD(state, updatedWord) {
      const index = state.words.findIndex(w => w.id === updatedWord.id);
      if (index !== -1) {
        state.words[index] = updatedWord;
      }
    },
    DELETE_WORD(state, wordId) {
      state.words = state.words.filter(w => w.id !== wordId);
    },
    SET_STATE(state, loadedState) {
      Object.assign(state, loadedState);
    }
  },
  actions: {
    initializeApp({ commit }) {
      const loadedState = storage.loadData();
      if (loadedState) {
        commit('SET_STATE', loadedState);
      }
    }
  },
  getters: {},
  plugins: [
    store => {
      store.subscribe((mutation, state) => {
        if (import.meta.env.DEV) {
          console.log(`[Plugin] Mutation detected: ${mutation.type}. Saving state to localStorage.`);
        }
        storage.saveData(state);
      });
    }
  ]
};

export default createStore(storeConfig);

