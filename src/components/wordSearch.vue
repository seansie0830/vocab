<template>
  <!-- 使用 form 和 flexbox 來建立一個語意化且對齊的佈局 -->
  <form @submit.prevent class="d-flex align-items-center gap-3 mb-4">
    
    <!-- 1. 使用 position-relative 作為容器，以便將清除按鈕定位在內部 -->
    <div class="position-relative flex-grow-1 shadow-sm rounded">
      <input
        type="text"
        class="form-control pe-5"
        placeholder="搜尋單字或解釋..."
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <!-- 
        2. 清除按鈕
        - 使用 v-if="modelValue" 在有輸入時才顯示
        - 使用 position-absolute 將其定位在輸入框的右側內部
        - 使用 Bootstrap 的 btn-close class 實現 'x' 樣式
      -->
      <button
        v-if="modelValue"
        class="btn-close position-absolute"
        type="button"
        @click="$emit('update:modelValue', '')"
        title="清除搜尋"
        style="top: 50%; right: 0.75rem; transform: translateY(-50%);"
      ></button>
    </div>

    <!-- 3. 外部的搜尋主按鈕 -->
    <button class="btn btn-primary d-flex align-items-center" type="submit">
      <i class="bi bi-search me-1"></i>
      <span>搜尋</span>
    </button>

  </form>
</template>

<script>
export default {
  name: 'WordSearch',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style scoped>
/* 確保 input focus 時的藍色光暈不會跟清除按鈕打架 */
.form-control:focus {
  box-shadow: none;
  border-color: #86b7fe; /* Bootstrap's default focus color */
}

/* 確保清除按鈕在 focus 時不會有額外的光暈 */
.btn-close:focus {
  box-shadow: none;
}
</style>

