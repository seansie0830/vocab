<template>
  <div class="ai-prompt-placeholder">
    <p>aiPrompt 施工中...</p>
  </div>
</template>

<script>
export default {
  name: 'AiPromptPlaceholder'
}
</script>

<style scoped>
.ai-prompt-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px; /* Adjust as needed */
  border: 1px dashed #ccc;
  color: #888;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.ai-prompt-placeholder p {
  margin: 0;
  padding: 10px;
}
</style>