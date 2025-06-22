/** @vitest-environment jsdom */

// 引入 vitest 的測試工具
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 引入我們要測試的目標
import storage from './storage.js';

const STORAGE_KEY = 'word-memory-app-data';

// --- 開始測試儲存服務 ---
describe('Storage Service (LocalStorageStrategy)', () => {

  // 在每個測試案例執行前，都建立一個 localStorage 的 "間諜" (spy)
  // 這讓我們可以監視 localStorage 的方法有沒有被呼叫，但又不真的去動到瀏覽器的 localStorage
  beforeEach(() => {
    // vi.spyOn 可以監視一個物件的方法
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
  });

  // 在每個測試案例結束後，清除所有監視，恢復原狀
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- 測試 saveData ---
  describe('saveData', () => {
    it('should call localStorage.setItem with correct key and stringified data', () => {
      const testData = { user: 'Sean', id: 123 };
      
      // 執行要測試的函式
      storage.saveData(testData);

      // 斷言：預期 localStorage.setItem 這個函式有被呼叫
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // 斷言：預期 localStorage.setItem 是用正確的參數被呼叫的
      // 參數1: 我們定義的 STORAGE_KEY
      // 參數2: 經過 JSON.stringify 轉換的資料字串
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(testData));
    });
  });

  // --- 測試 loadData ---
  describe('loadData', () => {
    it('should return parsed data when data exists in localStorage', () => {
      const testData = { user: 'Sean', data: [1, 2, 3] };
      // 模擬 localStorage.getItem 的行為，讓它回傳我們準備好的假資料
      localStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const loadedData = storage.loadData();

      // 斷言：預期 localStorage.getItem 有被以正確的 key 呼叫
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      // 斷言：預期讀取出來的資料會跟我們的測試資料完全一樣
      expect(loadedData).toEqual(testData);
    });

    it('should return null when no data exists in localStorage', () => {
      // 模擬 localStorage 中沒有資料的情況
      localStorage.getItem.mockReturnValue(null);

      const loadedData = storage.loadData();

      // 斷言：預期回傳值為 null
      expect(loadedData).toBeNull();
    });

    it('should return null and log an error when data is corrupted', () => {
      // 模擬 localStorage 中的資料是毀損的 (無法被 JSON.parse 解析)
      const corruptedData = '{"user":"Sean",';
      localStorage.getItem.mockReturnValue(corruptedData);
      
      // 同時也監視 console.error，看它會不會被呼叫
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const loadedData = storage.loadData();

      // 斷言：預期回傳值為 null
      expect(loadedData).toBeNull();
      // 斷言：預期 console.error 應該要被呼叫，代表我們的錯誤處理有生效
      expect(console.error).toHaveBeenCalled();
    });
  });
});

