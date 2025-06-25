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
  appSettings: {}
};

const store = createStore({
  state: initialState,

  mutations: {
    SET_STATE(state, loadedState) {
      if (loadedState) {
        state.words = loadedState.words || [];
        state.tags = loadedState.tags || [];
      }
    },
    SET_CURRENT_QUIZ(state, quizData) {
        state.currentQuiz = quizData;
    },
    REPLACE_ALL_DATA(state, newState) {
        state.words = newState.words || [];
        state.tags = newState.tags || [];
    },
    ADD_WORD(state, word) {
      state.words.push({ ...word, id: uuidv4(), tags: word.tags || [], unfamiliarity: word.unfamiliarity || 0 });
    },
    UPDATE_WORD(state, updatedWord) {
      const index = state.words.findIndex(w => w.id === updatedWord.id);
      if (index !== -1) {
        state.words[index] = { ...updatedWord, tags: updatedWord.tags || [] };
      }
    },
    DELETE_WORD(state, wordId) {
      state.words = state.words.filter(w => w.id !== wordId);
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
    },
    // --- NEW MUTATION for Quiz Review ---
    UPDATE_UNFAMILIARITY_SCORES(state, incorrectWordIds) {
      const incorrectSet = new Set(incorrectWordIds);
      state.words.forEach(word => {
        if (incorrectSet.has(word.id)) {
          word.unfamiliarity = (word.unfamiliarity || 0) + 1;
        }
      });
    }
  },

  actions: {
    loadState({ commit, state }) { 
      const loadedState = storage.loadData();
      
      if (loadedState && loadedState.words && loadedState.words.length > 0) {
        commit('SET_STATE', loadedState);
      } else if (import.meta.env.DEV && state.words.length === 0) {
        import('./mockData.json').then(mockData => {
          console.log('DEV MODE: Loading mock data into empty store.');
          commit('SET_STATE', mockData.default);
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
    // --- NEW ACTION for Quiz Review ---
    updateUnfamiliarityScores({ commit }, incorrectWordIds) {
      commit('UPDATE_UNFAMILIARITY_SCORES', incorrectWordIds);
    },
    replaceAllData({ commit, state }, newState) {
      commit('REPLACE_ALL_DATA', newState);
      storage.saveData(state);
    },
    addWord({ commit }, word) {
      commit('ADD_WORD', word);
    },
    updateWord({ commit }, word) {
      commit('UPDATE_WORD', word);
    },
    deleteWord({ commit }, wordId) {
      commit('DELETE_WORD', wordId);
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
    restoreDefaults({ commit }) {
      commit('CLEAR_ALL_DATA');
      import('./mockData.json').then(mockData => {
        console.log('DEV MODE: Restoring default mock data.');
        commit('SET_STATE', mockData.default);
      });
    }
  },

  getters: {}
});

store.subscribe((mutation, state) => {
  if (mutation.type === 'REPLACE_ALL_DATA') {
    return;
  }
  storage.saveData(state);
});

export default store;