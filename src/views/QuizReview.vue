<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <div class="col-lg-8 offset-lg-2">

        <div class="text-center mb-5">
          <i class="bi bi-check2-all display-3 text-success"></i>
          <h1 class="mt-2">考卷批改</h1>
          <p class="lead text-muted">請勾選所有答錯的題目。完成後，系統將會自動增加這些單字的陌生度，幫助您在未來加強複習。</p>
        </div>

        <div v-if="questions.length > 0">
          <div class="list-group">
            <div v-for="(question, index) in questions" :key="question.id" class="list-group-item">
              <div class="row align-items-center">
                <!-- Question Number and Checkbox -->
                <div class="col-2 col-md-1 text-center">
                  <span class="fw-bold me-3">{{ index + 1 }}.</span>
                  <input 
                    class="form-check-input p-2" 
                    type="checkbox" 
                    :value="question.id" 
                    v-model="incorrectWordIds"
                    :id="`check-${question.id}`"
                    style="transform: scale(1.5);">
                </div>
                <!-- Word and Definition -->
                <div class="col-10 col-md-11">
                  <label :for="`check-${question.id}`" class="d-block w-100" style="cursor: pointer;">
                    <h5 class="mb-1">{{ question.text }}</h5>
                    <p class="mb-0 text-secondary">{{ question.definition }}</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
  
          <div class="d-grid gap-2 mt-4">
            <button class="btn btn-success btn-lg" @click="submitReview">
              <i class="bi bi-award-fill me-2"></i>完成批改並更新熟悉度
            </button>
             <button class="btn btn-outline-secondary" @click="router.push('/')">
              放棄批改，返回首頁
            </button>
          </div>

        </div>

        <div v-else class="alert alert-warning text-center">
          <p class="mb-1">沒有可供批改的考卷。</p>
          <p class="mb-0">請先<router-link to="/quiz-config">產生一份考卷</router-link>。</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// --- State ---
// This will store the IDs of the words the user marked as incorrect.
const incorrectWordIds = ref([]);

// --- Computed Properties ---
const questions = computed(() => store.state.currentQuiz.questions);
const quizConfig = computed(() => store.state.currentQuiz.config);

// --- Methods ---
const submitReview = async () => {
  try {
    const incorrectCount = incorrectWordIds.value.length;
    const totalCount = questions.value.length;
    const correctCount = totalCount - incorrectCount;
    
    // We will implement this action in the next step
    await store.dispatch('updateUnfamiliarityScores', incorrectWordIds.value);
    
    alert(`批改完成！\n\n答對：${correctCount} 題\n答錯：${incorrectCount} 題\n\n系統已更新答錯單字的陌生度。`);
    
    // Navigate back to the home page after review
    router.push('/');

  } catch (error) {
    alert(`更新分數時發生錯誤：\n${error.message}`);
    console.error(error);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // If there are no questions when the page loads, redirect the user.
  if (!questions.value || questions.value.length === 0) {
    console.warn("No quiz found in store, redirecting to config.");
    // We don't redirect automatically to allow the user to see the "No quiz" message.
  }
});

</script>

<style scoped>
.list-group-item {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>