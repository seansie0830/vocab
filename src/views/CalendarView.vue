<template>
  <div class="container my-4">
    <h1 class="text-center my-4 display-4 text-dark ">月曆</h1>

    <div class="card shadow-lg p-4 ">
      <!-- 月份導覽區塊 -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button class="btn btn-primary rounded-lg shadow-sm" @click="prevMonth">
          上個月
        </button>
        <h2 class="h4 text-secondary">{{ currentMonthText }}</h2> <!-- 使用 computed 中的月份文字 -->
        <button class="btn btn-primary rounded-lg shadow-sm" @click="nextMonth">
          下個月
        </button>
      </div>

      <!-- 星期標題 -->
      <!-- 使用 custom class 'calendar-weekdays' 應用 CSS Grid -->
      <div class="text-center fw-bold border-bottom pb-2 mb-2 calendar-weekdays dateCell text-start">
        <div class="weekday-cell text-danger">日</div> <!-- 星期日紅色 -->
        <div class="weekday-cell">一</div>
        <div class="weekday-cell">二</div>
        <div class="weekday-cell">三</div>
        <div class="weekday-cell">四</div>
        <div class="weekday-cell">五</div>
        <div class="weekday-cell text-danger">六</div> <!-- 星期六紅色 -->
      </div>

      <!-- 日曆網格 (月份中的日期) -->
      <!-- 使用 custom class 'calendar-grid' 應用 CSS Grid -->
      <div class="calendar-grid">
        <!-- 遍歷生成的所有日期格子 -->
        <div v-for="(day, index) in days" :key="index"
             :class="{
               'calendar-day-cell': true, /* 每個日期格子的基礎樣式 */
               'text-dark bg-light': day.isCurrentMonth && !day.isWeekend, /* 當前月份的非週末日期 */
               'text-muted bg-light calendar-day-other-month': !day.isCurrentMonth && !day.isWeekend, /* 其他月份的非週末日期 */
               'empty-day': day.value === '', /* 空白格子 */
               'weekend-day-current': day.isCurrentMonth && day.isWeekend, /* 當前月份的週末日期 */
               'weekend-day-other': !day.isCurrentMonth && day.isWeekend /* 其他月份的週末日期 */,
               'dateCell': true /* 每個日期格子的基礎樣式 */
             }">
          {{ day.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarView',
  data() {
    return {
      currentDate: new Date(), // 現在顯示的月份的 Date 物件，初始化為當前日期
      days: [] // 儲存日曆網格中的所有日期數據
    };
  },
  computed: {
    // 動態計算顯示的月份文字 (例如: "2025 年 7 月")
    currentMonthText() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1; // getMonth() 是 0-indexed
      return `${year} 年 ${month} 月`;
    }
  },
  created() {
    // 在組件創建時生成日曆日期數據，用於介面呈現
    this.generateCalendarDays();
  },
  methods: {
    // 生成日曆網格中的日期數據
    generateCalendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth(); // getMonth() 是 0-indexed

      // 獲取當月第一天的 Date 物件
      const firstDayDate = new Date(year, month, 1);
      // 獲取當月第一天是星期幾 (0 = 星期日, 1 = 星期一, ..., 6 = 星期六)
      const firstDayOfMonthWeekday = firstDayDate.getDay();

      // 獲取當月的天數
      // Date(year, month + 1, 0) 會得到下個月的第 0 天，也就是當月的最後一天
      const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

      let calendarDays = [];

      // 填充上個月的日期以對齊星期的第一天
      // 獲取上個月的天數
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      for (let i = firstDayOfMonthWeekday; i > 0; i--) {
        const date = new Date(year, month - 1, daysInPrevMonth - i + 1);
        calendarDays.push({
          value: daysInPrevMonth - i + 1,
          isCurrentMonth: false,
          isWeekend: date.getDay() === 0 || date.getDay() === 6 // 0=星期日, 6=星期六
        });
      }

      // 填充當月的日期
      for (let i = 1; i <= daysInCurrentMonth; i++) {
        const date = new Date(year, month, i);
        calendarDays.push({
          value: i,
          isCurrentMonth: true,
          isWeekend: date.getDay() === 0 || date.getDay() === 6 // 0=星期日, 6=星期六
        });
      }

      // 填充下個月的日期以補滿日曆網格 (確保是完整的 6 週，共 42 天)
      const totalCellsNeeded = 42; // 最多顯示 6 週 x 7 天 = 42 個格子
      let dayForNextMonth = 1;
      while (calendarDays.length < totalCellsNeeded) {
        const date = new Date(year, month + 1, dayForNextMonth);
        calendarDays.push({
          value: dayForNextMonth,
          isCurrentMonth: false,
          isWeekend: date.getDay() === 0 || date.getDay() === 6 // 0=星期日, 6=星期六
        });
        dayForNextMonth++;
      }

      this.days = calendarDays;
    },
    // 切換到上一個月
    prevMonth() {
      // 設定日期為當月第一天，然後減去一個月
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1, 1));
      this.generateCalendarDays(); // 重新生成日曆日期
    },
    // 切換到下一個月
    nextMonth() {
      // 設定日期為當月第一天，然後加上一個月
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1, 1));
      this.generateCalendarDays(); // 重新生成日曆日期
    }
  }
};
</script>

<style>
/* 為了讓日曆格子看起來更方正，我們可以添加一些客製化樣式 */
.calendar-day-cell {
  aspect-ratio: 1 / 1; /* 保持方形比例 */
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  /* 移除置中相關樣式，改為靠左上角 */
  display: flex; /* 仍然使用 flexbox 以便控制內部元素 */
  align-items: flex-start; /* 垂直靠上對齊 */
  justify-content: flex-start; /* 水平靠左對齊 */
  text-align: left; /* 確保文字本身靠左 */
  border: 1px solid #dee2e6; /* Bootstrap 的 border-color */
  border-radius: 0.25rem; /* Bootstrap 的 rounded */
  padding: 0.75rem; /* Bootstrap 的 p-3 */
}

.calendar-day-cell:hover {
  background-color: #e2e6ea !important; /* Bootstrap 輕灰色，hover 效果 */
}

/* 針對空白格子的樣式，如果 `value` 為空，可以讓它不可點擊或背景色不同 */
.empty-day {
  background-color: #f8f9fa !important; /* 更淺的背景色 */
  cursor: default;
}

/* CSS Grid for Weekday Headers */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 等寬欄 */
  gap: 0.5rem; /* 類似 Bootstrap g-2 的間距 */
}

.weekday-cell {
  /* 確保星期文字也水平置中 */
  text-align: center;
}

/* CSS Grid for Calendar Dates */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 等寬欄 */
  gap: 0.5rem; /* 類似 Bootstrap g-2 的間距 */
  
}

/* 週末日期的樣式 */
/* 當前月份的週末日期 */
.weekend-day-current {
  color: #dc3545 !important; /* Bootstrap 'danger' red */
  background-color: #fff3f3 !important; /* 淺紅色背景，更柔和 */
}

/* 其他月份的週末日期 (較淡的紅色) */
.weekend-day-other {
  color: #fd7e14 !important; /* Bootstrap 'warning' orange，作為較淡的週末色 */
  background-color: #fff9f0 !important; /* 淺橙色背景 */
}
.dateCell {
  font-size: 1.5em;
}

/* Tailwind CSS (for rounded-lg and shadow-sm) will be loaded externally */
</style>
