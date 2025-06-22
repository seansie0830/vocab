// 引入 vitest 的測試工具
import { describe, it, expect, beforeEach } from 'vitest';

// 引入我們要測試的目標
import { createStore } from 'vuex';
// *** FIX: We import the named export `storeConfig`, which is the blueprint. ***
import { storeConfig } from './index.js';

// 建立一個輔助函式，以便在每個測試中都拿到全新的 store
const createTestStore = () => {
  // *** FIX: This is the robust way to create a fresh store for testing. ***
  // We only need to deep-clone the `state` object for isolation.
  // The mutations, actions, and plugins are functions and can be reused.
  return createStore({
    ...storeConfig,
    state: JSON.parse(JSON.stringify(storeConfig.state || {})),
  });
};

// 'describe' 是一個測試群組，我們把所有跟 store 相關的測試都放在這裡
describe('Vuex Store', () => {

  let store;

  // 'beforeEach' 會在每個 'it' 測試案例執行前都跑一次
  beforeEach(() => {
    store = createTestStore();
  });

  // --- 測試 Mutations ---
  describe('Mutations', () => {

    it('ADD_WORD: should add a word to the state', () => {
      const newWord = { id: 'word-test', term: 'test', definition: '測試' };
      // 執行 mutation
      store.commit('ADD_WORD', newWord);
      // 'expect' 是斷言，我們預期 state.words 的最後一項會是我們剛剛加入的單字
      // toContainEqual 會檢查陣列中是否有一個元素「內容等於」我們提供的物件
      expect(store.state.words).toContainEqual(newWord);
    });

    it('DELETE_WORD: should remove a word from the state by id', () => {
      const wordIdToDelete = 'word-1667826859456'; // 這是我們假資料中的一個ID
      const initialLength = store.state.words.length;

      store.commit('DELETE_WORD', wordIdToDelete);

      const finalLength = store.state.words.length;

      // 預期長度應該要 -1
      expect(finalLength).toBe(initialLength - 1);
      // 預期 state.words 陣列中，不應該再找到具有該 ID 的物件
      expect(store.state.words.find(w => w.id === wordIdToDelete)).toBeUndefined();
    });

    it('UPDATE_WORD: should update an existing word', () => {
      const updatedWord = {
        id: 'word-1667826859456', // 同一個 ID
        term: 'ubiquitous (updated)', // 新的內容
        definition: '無所不在的 (已更新)',
        tagIds: ['tag-1'],
        familiarityScore: 5,
        lastTestedAt: '2025-06-22T12:00:00Z',
        correctStreak: 1,
        notes: '已更新備註'
      };

      store.commit('UPDATE_WORD', updatedWord);

      // 預期在 state 中找到的 word 物件，應該要完全等於我們更新後的物件
      // toEqual 會遞迴地比較物件的所有屬性
      expect(store.state.words.find(w => w.id === updatedWord.id)).toEqual(updatedWord);
    });

    it('SET_STATE: should replace the entire state', () => {
        const newState = {
            tags: { 'tag-new': { id: 'tag-new', name: '新標籤', color: '#ffffff' }},
            words: [{ id: 'new-word', term: 'new', definition: '新的' }],
            currentQuiz: { words: ['new-word'], createdAt: 'now', settings: {} }
        };

        store.commit('SET_STATE', newState);

        expect(store.state).toEqual(newState);
    });

  });

});

