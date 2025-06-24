<template>
  <div class="quiz-print-container bg-light py-5">
    
    <!-- Action Buttons (Hidden on Print) -->
    <div class="actions-panel container mb-4 d-print-none">
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="goBackToConfig">
                <i class="bi bi-arrow-left-circle me-2"></i>返回重新設定
            </button>
             <button class="btn btn-success" @click="goToReview" :disabled="!quizGenerated">
                <i class="bi bi-check2-square me-2"></i>批改考卷
            </button>
            <button class="btn btn-primary" @click="printQuiz" :disabled="!quizGenerated">
                <i class="bi bi-printer-fill me-2"></i>列印此考卷
            </button>
        </div>
    </div>

    <!-- A4 Paper Simulation -->
    <div v-if="quizGenerated" class="a4-paper shadow mx-auto">
      <header class="text-center border-bottom pb-3 mb-4">
        <!-- MODIFIED: Title now reflects quiz direction -->
        <h3 class="quiz-Tittle">{{ quizTitle }}</h3>
        <p class="text-muted mb-0 quDate">日期: {{ quizDate }}</p>
      </header>

      <main class="question-grid">
        <!-- MODIFIED: Question text now depends on quiz direction -->
        <div v-for="(question, index) in questions" :key="question.id" class="question-item">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-word">{{ quizDirection === 'en-to-zh' ? question.text : question.definition }}</span>
            <span class="answer-line"></span>
        </div>
      </main>
    </div>

    <!-- Placeholder if no quiz is generated -->
    <div v-else class="container text-center">
        <div class="alert alert-warning">
            <h4 class="alert-heading">尚未產生考卷！</h4>
            <p>目前沒有可供預覽的考卷。請先返回設定頁面產生一份新的考卷。</p>
            <hr>
            <button class="btn btn-primary" @click="goBackToConfig">
                前往考卷設定
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// --- Computed Properties ---
const quizData = computed(() => store.state.currentQuiz);
const questions = computed(() => quizData.value?.questions || []);
const quizDirection = computed(() => quizData.value?.config?.direction || 'en-to-zh');
const quizGenerated = computed(() => questions.value.length > 0);
const quizDate = computed(() => new Date().toLocaleDateString('zh-TW'));

const quizTitle = computed(() => {
    return quizDirection.value === 'en-to-zh' ? '英翻中隨堂測驗' : '中翻英隨堂測驗';
});

// --- Methods ---
const printQuiz = () => {
  window.print();
};

const goBackToConfig = () => {
  router.push('/quiz-config');
};

const goToReview = () => {
  router.push('/quiz-review');
};

</script>

<style scoped>
/* Main container styling */

.quiz-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}
/* A4 paper simulation */
.a4-paper {
  background: white;
  width: 210mm;
  min-height: 297mm; /* Use min-height to allow content to grow */
  padding: 20mm;
  box-sizing: border-box;

}

/* Question grid layout */
.question-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* Let the rows grow naturally based on content */
  grid-auto-rows: minmax(40px, auto);
  gap: 15px 30px; /* row-gap column-gap */
  align-items: baseline;
}
.quDate{
  text-align: right;
}

.question-item {
  display: flex;
  align-items: baseline;
  border-bottom: 1px dotted #888;
  padding-bottom: 8px;
}

.question-number {
  font-weight: bold;
  margin-right: 8px;
}

.question-word {
  font-size: 1.1em;
  font-weight: 400;
  margin-right: 15px;
  /* Allow long definitions to wrap */
  word-break: break-word;
}

.answer-line {
  flex-grow: 1;
}


/* Styles for printing */
@media print {
  /* Hide everything except the A4 paper content */
  body * {
    visibility: hidden;
  }
  .a4-paper, .a4-paper * {
    visibility: visible;
  }
  .a4-paper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0; /* Let @page handle margins */
    box-shadow: none;
    border: none;
  }
  h1.quiz-Tittle{
    font-size : 24px;
  }
}

  /* Ensure the layout prints correctly */
  @page {
    size: A4;
    margin: 20mm;
  }

  .quiz-print-container {
      background-color: white !important;
  }

</style>
