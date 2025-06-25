<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <div class="col-lg-8 offset-lg-2">

        <div class="text-center mb-5">
          <div class="row my-3 align-items-center">
            <i class="bi bi-ui-checks display-3 text-info col-2"></i>
            <h1 class="col-10 text-start">選擇題測驗</h1>
          </div>
          <p class="lead text-muted" v-if="!quizCompleted">
            目前題目：{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </p>
        </div>

        <!-- Quiz in Progress -->
        <div v-if="currentQuestion && !quizCompleted" class="card shadow-sm mb-4">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">
              請問 "{{ currentQuestion.text }}" 的意思是？
            </h3>
            <div class="list-group">
              <button
                v-for="option in options"
                :key="option.id"
                class="list-group-item list-group-item-action mb-2 rounded-3 text-start"
                :class="{
                  'active': selectedAnswerId === option.id && !showFeedback,
                  'list-group-item-success': showFeedback && option.id === currentQuestion.id,
                  'list-group-item-danger': showFeedback && selectedAnswerId === option.id && selectedAnswerId !== currentQuestion.id,
                  'disabled': showFeedback
                }"
                @click="selectAnswer(option.id)"
                :disabled="showFeedback"
                :aria-label="`選項：${option.definition}`"
                role="button"
              >
                {{ option.definition }}
              </button>
            </div>

            <div v-if="showFeedback" :class="feedbackClass" class="alert mt-4 text-center">
              {{ feedbackMessage }}
              <div v-if="selectedAnswerId !== currentQuestion.id" class="mt-2">
                正確答案是: <strong>{{ currentQuestion.definition }}</strong>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button
                class="btn btn-primary btn-lg"
                @click="checkAnswer"
                :disabled="selectedAnswerId === null || showFeedback"
              >
                檢查答案
              </button>
              <button
                class="btn btn-info btn-lg"
                @click="nextQuestion"
                :disabled="!showFeedback"
              >
                {{ currentQuestionIndex < totalQuestions - 1 ? '下一題' : '完成測驗' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Quiz Completed -->
        <div v-else-if="quizCompleted" class="text-center py-5">
          <h2 class="display-4 text-success mb-4">測驗完成！</h2>
          <p class="lead">您答對了 {{ correctAnswersCount }} 題，共 {{ totalQuestions }} 題。</p>
          <p class="lead" v-if="incorrectWordIds.length > 0">
            有 {{ incorrectWordIds.length }} 個單字您需要加強：
          </p>
          <ul class="list-unstyled mt-3" v-if="incorrectWordIds.length > 0">
            <li v-for="wordId in incorrectWordIds" :key="wordId">
              - {{ getWordById(wordId)?.text }} ( {{ getWordById(wordId)?.definition }} )
            </li>
          </ul>
          <div class="mt-4">
            <router-link to="/quiz-config" class="btn btn-primary btn-lg me-3">
              返回考卷設定
            </router-link>
            <button class="btn btn-outline-secondary btn-lg" @click="resetQuiz">
              再測驗一次
            </button>
          </div>
        </div>

        <!-- No Quiz Data -->
        <div v-else class="alert alert-warning text-center py-5">
          <h4 class="alert-heading">沒有測驗資料！</h4>
          <p>請先前往考卷設定頁面產生測驗。</p>
          <router-link to="/quiz-config" class="btn btn-primary mt-3">前往考卷設定</router-link>
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

// Reactive State
const currentQuestionIndex = ref(0);
const selectedAnswerId = ref(null);
const quizCompleted = ref(false);
const correctAnswersCount = ref(0);
const incorrectWordIds = ref([]);
const showFeedback = ref(false);
const feedbackMessage = ref('');
const feedbackClass = ref('');

// Computed Properties
const currentQuiz = computed(() => store.state.currentQuiz);
const allWords = computed(() => store.state.words);

const currentQuestion = computed(() => {
  if (currentQuiz.value.questions && currentQuiz.value.questions.length > currentQuestionIndex.value) {
    return currentQuiz.value.questions[currentQuestionIndex.value];
  }
  return null;
});

const totalQuestions = computed(() => currentQuiz.value.questions ? currentQuiz.value.questions.length : 0);

const options = computed(() => {
  if (!currentQuestion.value) return [];
  return generateOptions(currentQuestion.value);
});

// Lifecycle Hook
onMounted(() => {
  if (!currentQuiz.value.questions || currentQuiz.value.questions.length === 0) {
    router.push('/quiz-config');
  }
});

// Methods
const getWordById = (id) => {
  return allWords.value.find(word => word.id === id);
};

// Generates multiple-choice options for a given word
const generateOptions = (correctWord) => {
  const optionsArray = [{ id: correctWord.id, definition: correctWord.definition }]; // Start with the correct answer
  
  // Filter out the correct word (by ID) and any words that have the same meaning as the correct word.
  const eligibleDistractors = allWords.value.filter(word =>
    word.id !== correctWord.id && word.definition !== correctWord.definition
  );

  const shuffledDistractors = shuffleArray([...eligibleDistractors]);

  // Take up to 3 distractors.
  let distractors = shuffledDistractors.slice(0, 3).map(d => ({ id: d.id, definition: d.definition }));

  // If we don't have 3 distractors, pad with placeholders to ensure 4 options in total.
  while (distractors.length < 3) {
    distractors.push({
      id: `placeholder-${distractors.length}-${Math.random()}`,
      definition: `[選項不足]`
    });
  }
  
  const finalOptions = shuffleArray([...optionsArray, ...distractors]);
  
  return finalOptions.slice(0, 4);
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const selectAnswer = (optionId) => {
  selectedAnswerId.value = optionId;
};

const checkAnswer = () => {
  if (selectedAnswerId.value === null) return;

  showFeedback.value = true;
  if (selectedAnswerId.value === currentQuestion.value.id) {
    correctAnswersCount.value++;
    feedbackMessage.value = '答對了！';
    feedbackClass.value = 'alert-success';
  } else {
    feedbackMessage.value = '答錯了。';
    feedbackClass.value = 'alert-danger';
    if (!incorrectWordIds.value.includes(currentQuestion.value.id)) {
      incorrectWordIds.value.push(currentQuestion.value.id);
    }
  }
};

const nextQuestion = () => {
  if (currentQuestionIndex.value >= totalQuestions.value - 1) {
    quizCompleted.value = true;
    store.dispatch('updateUnfamiliarityScores', incorrectWordIds.value);
  } else {
    currentQuestionIndex.value++;
    selectedAnswerId.value = null;
    showFeedback.value = false;
    feedbackMessage.value = '';
    feedbackClass.value = '';
  }
};

const resetQuiz = () => {
  currentQuestionIndex.value = 0;
  selectedAnswerId.value = null;
  quizCompleted.value = false;
  correctAnswersCount.value = 0;
  incorrectWordIds.value = [];
  showFeedback.value = false;
  feedbackMessage.value = '';
  feedbackClass.value = '';
};

</script>

<style scoped>
/* Custom styles */
.list-group-item {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.list-group-item:hover:not(.disabled) {
  background-color: var(--bs-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.list-group-item.active {
  background-color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
}

.list-group-item.list-group-item-success {
  background-color: #d4edda !important;
  border-color: #28a745 !important;
  color: #155724 !important;
  font-weight: bold;
}

.list-group-item.list-group-item-danger {
  background-color: #f8d7da !important;
  border-color: #dc3545 !important;
  color: #721c24 !important;
  font-weight: bold;
}

.btn-lg {
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  border-radius: 0.5rem;
}

.alert {
  border-radius: 0.5rem;
}
</style>
