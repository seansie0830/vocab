// src/services/storage.js

/**
 * 這是我們儲存策略的核心。
 * 未來如果想換成 IndexedDB 或其他儲存方式，
 * 只需要建立一個新的 Strategy 物件，並確保它有相同的 saveData 和 loadData 方法即可。
 * 這樣就不需要修改任何 Vuex 中的程式碼。
 */

// 定義一個獨一無二的 key，用來在 Local Storage 中儲存我們的資料
const STORAGE_KEY = 'word-memory-app-data';

const LocalStorageStrategy = {
  /**
   * 儲存資料到 Local Storage
   * @param {object} data - 任何可以被 JSON 序列化的物件 (在我們的例子中，就是整個 Vuex state)
   */
  saveData(data) {
    try {
      // Local Storage 只能儲存字串，所以我們需要將物件轉換為 JSON 字串
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serializedData);
    } catch (error) {
      // 如果儲存失敗（例如儲存空間已滿），在控制台印出錯誤訊息
      console.error("Error saving data to localStorage:", error);
    }
  },

  /**
   * 從 Local Storage 讀取資料
   * @returns {object | null} - 回傳解析後的物件，如果沒有資料或解析失敗則回傳 null
   */
  loadData() {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      // 如果找不到資料，直接回傳 null
      if (serializedData === null) {
        return null;
      }
      // 將讀取到的 JSON 字串轉換回 JavaScript 物件
      return JSON.parse(serializedData);
    } catch (error) {
      // 如果解析 JSON 失敗（例如資料已損毀），在控制台印出錯誤訊息並回傳 null
      console.error("Error loading data from localStorage:", error);
      return null;
    }
  }
};

// 預設匯出這個策略物件
export default LocalStorageStrategy;
