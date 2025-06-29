<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <div class="col-lg-8 offset-lg-2">
        
        <div class="text-center mb-5">
          <div class="row my-3">
            <i class="bi bi-play-circle display-3 text-success col-2"></i>
            <h1 class="col-10 text-start">線上測驗</h1>
          </div>
          <p class="lead text-muted">請仔細作答，完成後將自動批改並更新單字陌生度。</p>
        </div>

        <div v-if="currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0">
          <div class="card mb-4 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                題目 {{ currentQuestionIndex + 1 }} / {{ currentQuiz.questions.length }}
              </h5>
              <span class="badge bg-primary fs-6">{{ quizDirection === 'en-to-zh' ? '英翻中' : '中翻英' }}</span>
            </div>
            <div class="card-body">
              <h4 class="card-title text-center mb-4">
                {{ currentQuestionContent }}
              </h4>
              <div class="form-floating mb-3">
                <input 
                  type="text" 
                  class="form-control form-control-lg" 
                  id="user-answer" 
                  placeholder="請輸入您的答案" 
                  v-model="userAnswer"
                  @keyup.enter="nextQuestion"
                >
                <label for="user-answer">請輸入您的答案</label>
              </div>
              <div v-if="submitted && currentQuestionResult">
                <div v-if="currentQuestionResult.isCorrect" class="alert alert-success mt-3">
                  <strong>正確！</strong>
                </div>
                <div v-else class="alert alert-danger mt-3">
                  <strong>錯誤！</strong> 正確答案是: 
                  <span class="fw-bold">{{ currentCorrectAnswer }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button 
              v-if="currentQuestionIndex > 0 && !submitted" 
              @click="previousQuestion" 
              class="btn btn-secondary btn-lg"
            >
              <i class="bi bi-arrow-left me-2"></i> 上一題
            </button>
            <button 
              @click="nextQuestion" 
              class="btn btn-primary btn-lg ms-auto"
            >
              {{ isLastQuestion && !submitted ? '提交測驗' : (isLastQuestion && submitted ? '完成測驗' : '下一題') }} <i class="bi bi-arrow-right ms-2"></i>
            </button>
            <!-- Removed the separate finishQuiz button as nextQuestion handles it now -->
          </div>
        </div>
        <div v-else class="alert alert-info text-center py-5">
          <h4 class="alert-heading">沒有考題！</h4>
          <p>請先前往 <router-link to="/quiz-config" class="alert-link">考卷設定</router-link> 頁面產生一份考卷。</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'; // Added onMounted
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// --- State ---
const currentQuiz = computed(() => store.state.currentQuiz);
const currentQuestionIndex = ref(0);
const userAnswer = ref('');
const answeredQuestions = ref([]); // Store user's answers and correctness
const submitted = ref(false); // Tracks if the current question's answer has been submitted/checked

console.log('OnlineQuizRun component mounted.');

// Initialize answeredQuestions based on currentQuiz when it loads
watch(currentQuiz, (newQuiz) => {
  console.log('currentQuiz changed:', newQuiz);
  if (newQuiz && newQuiz.questions && newQuiz.questions.length > 0) {
    // Only (re)initialize if answeredQuestions is empty OR if the quiz content actually changed
    // A simple check for quiz questions array reference equality. For complex objects, deep clone/compare might be needed.
    // newQuiz is just the updated currentQuiz from the stor
    const currentQuestionIds = answeredQuestions.value.map(q => q.id).sort().join(',');
    const newQuestionIds = newQuiz.questions.map(q => q.id).sort().join(',');

    if (answeredQuestions.value.length === 0 || currentQuestionIds !== newQuestionIds) {
        answeredQuestions.value = newQuiz.questions.map(q => ({
            id: q.id,
            userAnswer: '',
            isCorrect: false,
            word: q.word, // Keep word and definition for checking
            definition: q.definition
        }));
        currentQuestionIndex.value = 0; // Reset index when a new quiz is loaded
        userAnswer.value = '';
        submitted.value = false;
        console.log('answeredQuestions initialized/re-initialized:', answeredQuestions.value);
    }
  } else {
    // If currentQuiz becomes null or empty, reset everything
    answeredQuestions.value = [];
    currentQuestionIndex.value = 0;
    userAnswer.value = '';
    submitted.value = false;
    console.log('currentQuiz is empty or invalid. Resetting answeredQuestions.');
  }
}, { immediate: true, deep: true }); // Use deep watch for changes within currentQuiz object

// --- Computed Properties ---
const currentQuestion = computed(() => {
  // Added index boundary checks here as per user's suggestion
  if (currentQuiz.value && currentQuiz.value.questions && 
      currentQuestionIndex.value >= 0 && 
      currentQuestionIndex.value < currentQuiz.value.questions.length) {
    return currentQuiz.value.questions[currentQuestionIndex.value];
  }
  return null; // Return null if quiz or questions are not ready, or index is out of bounds
});

const quizDirection = computed(() => {
  return currentQuiz.value.config.direction || 'en-to-zh';
});

const currentQuestionContent = computed(() => {
    if (currentQuestion.value) {
        // Use the same logic as currentCorrectAnswer but swap direction
        const answer = quizDirection.value === 'en-to-zh'
            ? currentQuestion.value.text
            : currentQuestion.value.definition; // Corrected: Should be definition for zh-to-en
        return typeof answer === 'string' ? answer : '';
    }
    return '';
});

const currentQuestionResult = computed(() => {
    if (answeredQuestions.value[currentQuestionIndex.value]) {
        return answeredQuestions.value[currentQuestionIndex.value];
    }
    return null;
});

const currentCorrectAnswer = computed(() => {
    if (currentQuestion.value) {
        // Explicitly check for string type for correctness display
        const answer = quizDirection.value === 'en-to-zh' 
            ? currentQuestion.value.definition 
            : currentQuestion.value.text;
        return typeof answer === 'string' ? answer : ''; // Ensure it's a string, or empty
    }
    return '';
});

const isLastQuestion = computed(() => {
  return currentQuiz.value && currentQuiz.value.questions && currentQuestionIndex.value === currentQuiz.value.questions.length - 1;
});

// --- Methods ---

// Checks the user's answer against the correct answer
const checkAnswer = () => {
  if (!currentQuestion.value) return;

  // Use the robust currentCorrectAnswer computed property for comparison
  const correctAnswer = currentCorrectAnswer.value;

  // Simple trim and toLowerCase for basic comparison
  const isCorrect = String(userAnswer.value).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

  // Ensure answeredQuestions has the current index entry
  if (!answeredQuestions.value[currentQuestionIndex.value]) {
      answeredQuestions.value[currentQuestionIndex.value] = { 
          id: currentQuestion.value.id, 
          userAnswer: '', 
          isCorrect: false,
          word: currentQuestion.value.word,
          definition: currentQuestion.value.definition
      };
  }
  answeredQuestions.value[currentQuestionIndex.value].userAnswer = userAnswer.value;
  answeredQuestions.value[currentQuestionIndex.value].isCorrect = isCorrect;
  submitted.value = true; // Mark as submitted for immediate feedback
  console.log(`Question ${currentQuestionIndex.value + 1} checked. Correct: ${isCorrect}`);
};

const nextQuestion = () => {
  // First, check the answer if not already submitted for the current question
  if (!submitted.value) {
    checkAnswer();
    // After checking, the button text will change to '下一題' or '完成測驗'
    // User needs to click again to proceed
    return; 
  }

  // If it's the last question and already submitted, finish the quiz
  if (isLastQuestion.value) {
    finishQuiz();
    return;
  }

  // Move to the next question
  currentQuestionIndex.value++;
  // Load previous answer for the new current question if exists, otherwise empty
  userAnswer.value = answeredQuestions.value[currentQuestionIndex.value]?.userAnswer || ''; 
  submitted.value = false; // Reset submitted state for the new question
  console.log('Moving to next question:', currentQuestionIndex.value + 1);
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    // Load previous answer for the new current question
    userAnswer.value = answeredQuestions.value[currentQuestionIndex.value]?.userAnswer || ''; 
    submitted.value = false; // Reset submitted state for the new question
    console.log('Moving to previous question:', currentQuestionIndex.value + 1);
  }
};

const finishQuiz = async () => {
  console.log('Finishing quiz...');
  const incorrectWordIds = answeredQuestions.value
    .filter(q => !q.isCorrect)
    .map(q => q.id);

  if (incorrectWordIds.length > 0) {
    console.log('Updating unfamiliarity scores for incorrect words:', incorrectWordIds);
    await store.dispatch('updateUnfamiliarityScores', incorrectWordIds);
  }

  alert(`測驗完成！您答對了 ${currentQuiz.value.questions.length - incorrectWordIds.length} 題，答錯了 ${incorrectWordIds.length} 題。`);
  router.push('/'); // Navigate back to home or a quiz summary page
};

// Lifecycle hook to ensure quiz data is loaded (important for direct access or refresh)
onMounted(() => {
    // Only attempt to load state if currentQuiz is truly empty.
    // The watch with immediate:true will handle updates after state is loaded by store.dispatch('loadState').
    if (!currentQuiz.value || !currentQuiz.value.questions || currentQuiz.value.questions.length === 0) {
        console.log('No quiz data found on mount. Dispatching loadState.');
        store.dispatch('loadState');
    }
});

// Watch for direct navigation to this route to reset quiz state if needed
watch(() => router.currentRoute.value.path, (newPath) => {
    if (newPath === '/quiz-run') {
        // If navigating directly to /quiz-run, and currentQuiz is already populated,
        // it means we might be re-entering a quiz. Reset current question index and UI state.
        if (currentQuiz.value && currentQuiz.value.questions && currentQuiz.value.questions.length > 0) {
            console.log('Navigated to /quiz-run, re-initializing quiz UI state.');
            currentQuestionIndex.value = 0;
            userAnswer.value = '';
            submitted.value = false;
            // Re-map answeredQuestions to reset user answers for a new attempt
            answeredQuestions.value = currentQuiz.value.questions.map(q => ({
                id: q.id,
                userAnswer: '',
                isCorrect: false,
                word: q.word,
                definition: q.definition
            }));
        }
    }
});
</script>

<style scoped>
.card-header {
  background-color: rgba(0,0,0,0.03);
  border-bottom: 1px solid rgba(0,0,0,0.125);
}

.card-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

.form-control-lg {
    height: calc(3.5rem + 2px);
    padding: 0.75rem 1rem;
    font-size: 1.25rem;
    line-height: 1.5;
    border-radius: 0.5rem;
}

.form-floating > label {
    padding: 0.75rem 1rem;
}
</style>
