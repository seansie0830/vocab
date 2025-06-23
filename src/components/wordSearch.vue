<template>
  <div class="input-group">
    <span class="input-group-text" id="search-addon"><i class="bi bi-search"></i></span>
    <input 
      type="text" 
      class="form-control" 
      placeholder="搜尋單字或定義..." 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      aria-label="Search" 
      aria-describedby="search-addon"
    >
  </div>
</template>

<script setup>
// 該元件被設計用來與 v-model 協作。
// 它接收一個 'modelValue' prop，並在數值變更時，發出一個 'update:modelValue' 事件。
defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>
