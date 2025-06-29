import { createStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import storage from '../services/storage';

const initialState = {
  words: [],
  tags: [],
  currentQuiz: {
    questions: [],
    config: {}
  },
  appSettings: {},
  queryResult: [], // 新增：用於儲存搜尋結果的單字列表
  searchQuery: '', // 新增：用於儲存當前搜尋關鍵字
};

const store = createStore({
  state: initialState,

  mutations: {
    SET_STATE(state, loadedState) {
      if (loadedState) {
        state.words = loadedState.words || [];
        state.tags = loadedState.tags || [];
        // 當載入狀態時，初始化 queryResult 為所有單字
        state.queryResult = loadedState.words || [];
      }
    },
    SET_CURRENT_QUIZ(state, quizData) {
      state.currentQuiz = quizData;
    },
    REPLACE_ALL_DATA(state, newState) {
      state.words = newState.words || [];
      state.tags = newState.tags || [];
      // 當替換所有資料時，更新 queryResult
      state.queryResult = newState.words || [];
    },
    ADD_WORD(state, word) {
      const newWord = { ...word, id: uuidv4(), tags: word.tags || [], unfamiliarity: word.unfamiliarity || 0 };
      state.words.push(newWord);
      // 新增單字後，重新執行搜尋以更新 queryResult (如果沒有搜尋關鍵字，則會顯示所有單字)
      // 注意：這裡直接操作 words，但 queryResult 的更新通常由 performSearch action 負責
      // 為了確保一致性，建議在 addWord action 中呼叫 performSearch
    },
    UPDATE_WORD(state, updatedWord) {
      const index = state.words.findIndex(w => w.id === updatedWord.id);
      if (index !== -1) {
        state.words[index] = { ...updatedWord, tags: updatedWord.tags || [] };
      }
      // 更新單字後，重新執行搜尋以更新 queryResult
      // 同上，建議在 updateWord action 中呼叫 performSearch
    },
    DELETE_WORD(state, wordId) {
      state.words = state.words.filter(w => w.id !== wordId);
      // 刪除單字後，重新執行搜尋以更新 queryResult
      // 同上，建議在 deleteWord action 中呼叫 performSearch
    },
    ADD_TAG(state, newTag) {
      const tagToAdd = typeof newTag === 'object' ? newTag : { id: uuidv4(), name: newTag };
      if (!state.tags.some(t => t.id === tagToAdd.id || t.name === tagToAdd.name)) {
        state.tags.push(tagToAdd);
      }
    },
    DELETE_TAG(state, tagId) {
      state.tags = state.tags.filter(t => t.id !== tagId);
    },
    REMOVE_TAG_FROM_WORDS(state, tagId) {
      state.words.forEach(word => {
        if (word.tags && word.tags.includes(tagId)) {
          word.tags = word.tags.filter(tId => tId !== tagId);
        }
      });
    },
    CLEAR_ALL_DATA(state) {
      state.words = [];
      state.tags = [];
      state.queryResult = []; // 清空所有資料時，清空搜尋結果
    },
    UPDATE_UNFAMILIARITY_SCORES(state, incorrectWordIds) {
      const incorrectSet = new Set(incorrectWordIds);
      state.words.forEach(word => {
        if (incorrectSet.has(word.id)) {
          word.unfamiliarity = (word.unfamiliarity || 0) + 1;
        }
      });
      // 更新陌生度後，重新執行搜尋以更新 queryResult
      // 同上，建議在 updateUnfamiliarityScores action 中呼叫 performSearch
    },
    // 新增：設定搜尋結果的 mutation
    SET_QUERY_RESULT(state, resultWords) {
      state.queryResult = resultWords;
    },
    // 新增：設定當前搜尋關鍵字的 mutation
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query;
    }
  },

  actions: {
    loadState({ commit, state, dispatch }) {
      const loadedState = storage.loadData();

      if (loadedState && loadedState.words && loadedState.words.length > 0) {
        commit('SET_STATE', loadedState);
        // 載入資料後，預設執行一次空關鍵字的搜尋 (顯示所有單字)，並設定初始 searchQuery
        commit('SET_SEARCH_QUERY', '');
        dispatch('performSearch', '');
      } else if (import.meta.env.DEV && state.words.length === 0) {
        import('./mockData.json').then(mockData => {
          console.log('DEV MODE: Loading mock data into empty store.');
          commit('SET_STATE', mockData.default);
          // 載入 mock 資料後，預設執行一次空關鍵字的搜尋，並設定初始 searchQuery
          commit('SET_SEARCH_QUERY', '');
          dispatch('performSearch', '');
        });
      }
    },
    generateQuiz({ commit, state }, config) {
      let candidateWords = state.words;

      // Filter by unfamiliarity
      candidateWords = candidateWords.filter(word => (word.unfamiliarity || 0) >= config.unfamiliarity);

      // Filter by tags
      if (config.tags && config.tags.length > 0) {
        const selectedTagSet = new Set(config.tags);
        candidateWords = candidateWords.filter(word =>
          word.tags && word.tags.some(tagId => selectedTagSet.has(tagId))
        );
      }

      if (candidateWords.length < config.count) {
        throw new Error(`符合條件的單字只有 ${candidateWords.length} 個，不足以產生 ${config.count} 題的考卷。`);
      }

      for (let i = candidateWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidateWords[i], candidateWords[j]] = [candidateWords[j], candidateWords[i]];
      }

      const questions = candidateWords.slice(0, config.count);

      commit('SET_CURRENT_QUIZ', {
        questions: questions,
        config: config
      });
    },
    updateUnfamiliarityScores({ commit, dispatch, state }, incorrectWordIds) {
      commit('UPDATE_UNFAMILIARITY_SCORES', incorrectWordIds);
      // 更新陌生度後重新搜尋，使用當前儲存的 searchQuery
      dispatch('performSearch', state.searchQuery);
    },
    replaceAllData({ commit, state, dispatch }, newState) {
      commit('REPLACE_ALL_DATA', newState);
      storage.saveData(state);
      // 替換資料後重新搜尋，使用當前儲存的 searchQuery
      dispatch('performSearch', state.searchQuery);
    },
    addWord({ commit, dispatch, state }, word) {
      commit('ADD_WORD', word);
      // 新增單字後重新搜尋，使用當前儲存的 searchQuery
      dispatch('performSearch', state.searchQuery);
    },
    updateWord({ commit, dispatch, state }, word) {
      commit('UPDATE_WORD', word);
      // 更新單字後重新搜尋，使用當前儲存的 searchQuery
      dispatch('performSearch', state.searchQuery);
    },
    deleteWord({ commit, dispatch, state }, wordId) {
      commit('DELETE_WORD', wordId);
      // 刪除單字後重新搜尋，使用當前儲存的 searchQuery
      dispatch('performSearch', state.searchQuery);
    },
    addTag({ commit }, tagData) {
      const newTag = typeof tagData === 'object' ? tagData : { id: uuidv4(), name: tagData };
      commit('ADD_TAG', newTag);
      return newTag;
    },
    deleteTag({ commit }, tagId) {
      commit('REMOVE_TAG_FROM_WORDS', tagId);
      commit('DELETE_TAG', tagId);
    },
    clearAllData({ commit }) {
      commit('CLEAR_ALL_DATA');
    },
    restoreDefaults({ commit, dispatch }) {
      commit('CLEAR_ALL_DATA');
      import('./mockData.json').then(mockData => {
        console.log('DEV MODE: Restoring default mock data.');
        commit('SET_STATE', mockData.default);
        // 恢復預設資料後執行一次空關鍵字的搜尋，並設定 searchQuery
        commit('SET_SEARCH_QUERY', '');
        dispatch('performSearch', '');
      });
    },
    // 更新：執行搜尋的 action，支援多關鍵字和標籤搜尋
    performSearch({ commit, state }, keyword) {
      const query = (keyword || '').trim();
      commit('SET_SEARCH_QUERY', query); // 設定當前搜尋關鍵字

      let resultWords;

      if (!query) {
        resultWords = state.words; // 如果沒有關鍵字，返回所有單字
      } else {
        // 將查詢字串按一個或多個空格分割成單獨的關鍵字
        const individualKeywords = query.split(/\s+/).filter(term => term.length > 0);
        // 檢查是否有任何關鍵字以 '#' 開頭，以判斷是否進入混合搜尋模式
        const containsTagPrefix = individualKeywords.some(term => term.startsWith('#'));

        if (containsTagPrefix) {
          // 混合搜尋模式：同時處理標籤關鍵字和正常文字關鍵字
          resultWords = state.words.filter(word => {
            // 檢查單字是否匹配任一關鍵字 (文字或標籤)。使用 'some' 意味著只要匹配其中一個關鍵字即可。
            return individualKeywords.some(term => {
              const lowerCaseTerm = term.toLowerCase();

              if (lowerCaseTerm.startsWith('#')) {
                // 標籤搜尋部分：移除 '#' 並搜尋標籤名稱
                const tagNameSearch = lowerCaseTerm.substring(1);
                // 找到所有名稱包含 tagNameSearch 的標籤 ID
                const matchingTagIds = state.tags
                  .filter(tag => tag.name.toLowerCase().includes(tagNameSearch))
                  .map(tag => tag.id);

                // 檢查單字的 tags 陣列中是否包含任一匹配的標籤 ID
                return word.tags && word.tags.some(wordTagId => matchingTagIds.includes(wordTagId));

              } else {
                // 正常文字搜尋部分：搜尋單字文本或定義
                return word.text.toLowerCase().includes(lowerCaseTerm) ||
                       word.definition.toLowerCase().includes(lowerCaseTerm);
              }
            });
          });
        } else {
          // 純文字搜尋模式 (沒有任何關鍵字以 '#' 開頭)
          resultWords = state.words.filter(word => {
            // 檢查單字是否匹配任一關鍵字 (文字或定義)。使用 'some' 意味著只要匹配其中一個關鍵字即可。
            return individualKeywords.some(term => {
              const lowerCaseTerm = term.toLowerCase();
              return word.text.toLowerCase().includes(lowerCaseTerm) ||
                     word.definition.toLowerCase().includes(lowerCaseTerm);
            });
          });
        }
      }
      commit('SET_QUERY_RESULT', resultWords); // 將搜尋結果存入 queryResult
    }
  },

  getters: {}
});

// 在 `store.subscribe` 中，只有當涉及 `words` 或 `tags` 狀態變更時才儲存資料。
// `SET_QUERY_RESULT` 和 `SET_SEARCH_QUERY` 不會觸發數據持久化，因為它們只是一個衍生狀態。
store.subscribe((mutation, state) => {
  // 檢查 mutation 是否是那些需要儲存的類型
  const mutationsToPersist = [
    'ADD_WORD', 'UPDATE_WORD', 'DELETE_WORD',
    'ADD_TAG', 'DELETE_TAG', 'REMOVE_TAG_FROM_WORDS',
    'REPLACE_ALL_DATA', 'CLEAR_ALL_DATA', 'UPDATE_UNFAMILIARITY_SCORES'
  ];

  if (mutationsToPersist.includes(mutation.type)) {
    storage.saveData(state);
  }
});

export default store;
