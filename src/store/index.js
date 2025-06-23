import { createStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import storage from '../services/storage';

const initialState = {
  words: [],
  tags: [],
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
    REPLACE_ALL_DATA(state, newState) {
        state.words = newState.words || [];
        state.tags = newState.tags || [];
    },
    ADD_WORD(state, word) {
      state.words.push({ ...word, id: uuidv4(), tags: word.tags || [] });
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
      state.tags.push(newTag);
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
    // --- MODIFIED ACTION for Import ---
    replaceAllData({ commit, state }, newState) {
      commit('REPLACE_ALL_DATA', newState);
      // Explicitly save the state to storage after importing,
      // ensuring the change is persisted immediately.
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
    async addTag({ commit }, tagName) {
      const newTag = {
        id: uuidv4(),
        name: tagName
      };
      commit('ADD_TAG', newTag);
      return newTag;
    },
    deleteTag({ commit }, tagId) {
      commit('REMOVE_TAG_FROM_WORDS', tagId);
      commit('DELETE_TAG', tagId);
    }
  },

  getters: {}
});

// The subscription is still useful for all other data manipulations.
store.subscribe((mutation, state) => {
  // We can prevent saving during the import mutation since the action already handles it.
  if (mutation.type === 'REPLACE_ALL_DATA') {
    return;
  }
  storage.saveData(state);
});

export default store;

