<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <div class="col-lg-8 offset-lg-2">

        <div class="text-center mb-5">
          <div class="row my-3">
            <i class="bi bi-pencil-square display-3 text-primary col-2"></i>
            <h1 class=" col-10 text-start">考卷設定</h1>
          </div>
          <p class="lead text-muted">請選擇您想測驗的範圍與題目數量，來產生一份個人專屬的考卷。</p>
        </div>

        <form @submit.prevent="handleGenerateQuiz">
          <!-- Step 1: Select Quiz Mode -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">第一步：選擇考卷出題方式</h5>
            </div>
            <div class="card-body">
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="quizMode" id="mode-online" value="online" v-model="quizMode" autocomplete="off" checked>
                <label class="btn btn-outline-primary w-100" for="mode-online">線上版 (即時批改、陌生度紀錄)</label>

                <input type="radio" class="btn-check" name="quizMode" id="mode-print" value="print" v-model="quizMode" autocomplete="off">
                <label class="btn btn-outline-primary w-100" for="mode-print">列印版 (可列印紙本考卷)</label>
              </div>
            </div>
          </div>

          <!-- Step 2: Select Tags -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">第二步：選擇標籤範圍</h5>
            </div>
            <div class="card-body">
              <p class="card-text text-muted">選擇您想測驗的標籤。若不選擇，將從所有單字中抽選。</p>
              <div v-if="allTags.length > 0" class="tag-selection-container border rounded p-3" style="max-height: 250px; overflow-y: auto;">
                <div v-for="tag in allTags" :key="tag.id" class="form-check form-check-inline mb-2">
                  <input class="form-check-input" type="checkbox" :id="`tag-${tag.id}`" :value="tag.id" v-model="selectedTags">
                  <label class="form-check-label" :for="`tag-${tag.id}`">{{ tag.name }}</label>
                </div>
              </div>
              <div v-else class="alert alert-warning">
                目前沒有任何標籤可供選擇。
              </div>
            </div>
          </div>

          <!-- Step 3: Select Quiz Direction -->
          <div class="card mb-4 shadow-sm">
              <div class="card-header">
                  <h5 class="mb-0">第三步：選擇測驗方向</h5>
              </div>
              <div class="card-body">
                  <div class="btn-group w-100" role="group">
                      <input type="radio" class="btn-check" name="quizDirection" id="dir-en-zh" value="en-to-zh" v-model="quizDirection" autocomplete="off" checked>
                      <label class="btn btn-outline-primary w-100" for="dir-en-zh">英翻中 (給英文，寫中文)</label>

                      <input type="radio" class="btn-check" name="quizDirection" id="dir-zh-en" value="zh-to-en" v-model="quizDirection" autocomplete="off">
                      <label class="btn btn-outline-primary w-100" for="dir-zh-en">中翻英 (給中文，寫英文)</label>
                  </div>
              </div>
          </div>

          <!-- NEW Step 4: Select Question Type (Moved from Step 6) -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">第四步：選擇題目形式</h5>
            </div>
            <div class="card-body">
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="questionType" id="type-fill-blank" value="fill-blank" v-model="questionType" autocomplete="off" checked>
                <label class="btn btn-outline-primary w-100" for="type-fill-blank">填空題</label>

                <input type="radio" class="btn-check" name="questionType" id="type-multiple-choice" value="multiple-choice" v-model="questionType" autocomplete="off">
                <label class="btn btn-outline-primary w-100" for="type-multiple-choice">選擇題</label>

                <input type="radio" class="btn-check" name="questionType" id="type-true-false" value="true-false" v-model="questionType" autocomplete="off">
                <label class="btn btn-outline-primary w-100" for="type-true-false">是非題</label>
              </div>
            </div>
          </div>

          <!-- Step 5: Set Unfamiliarity Level (Moved from Step 4) -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header">
                <h5 class="mb-0">第五步：選擇陌生度</h5>
            </div>
            <div class="card-body">
                <label for="unfamiliarity-slider" class="form-label">
                    只測驗陌生度 <b class="text-danger">{{ unfamiliarityLowerLimit }}</b> 分以上的單字
                </label>
                <input type="range" class="form-range" min="0" max="10" step="1" id="unfamiliarity-slider" v-model.number="unfamiliarityLowerLimit">
                <div class="d-flex justify-content-between form-text">
                    <span>(0=已精通)</span>
                    <span>(分數越高越陌生)</span>
                </div>
            </div>
          </div>

          <!-- Step 6: Set Question Count (Moved from Step 5) -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">第六步：設定題目數量</h5>
            </div>
            <div class="card-body">
              <label for="question-count" class="form-label">您希望產生幾題題目？</label>
              <input type="number" class="form-control" id="question-count" v-model.number="questionCount" min="1" :max="availableWordCount">
              <div class="form-text">
                根據您選擇的條件，目前共有 <b class="text-success">{{ availableWordCount }}</b> 個單字可供選擇。
              </div>
            </div>
          </div>

          <!-- Step 7: Generate Quiz (Moved from Step 7, renumbered) -->
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="!isFormValid">
              <i class="bi bi-check2-circle me-2"></i>
              產生考卷並預覽
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// --- State for the form ---
const quizMode = ref('online'); // 'online' or 'print' 考卷模式
const selectedTags = ref([]); // 選取的標籤
const questionCount = ref(10); // 題目數量
const unfamiliarityLowerLimit = ref(0); // 陌生度下限
const quizDirection = ref('en-to-zh'); // 'en-to-zh' 或 'zh-to-en' 測驗方向
const questionType = ref('fill-blank'); // 題目形式: 'fill-blank', 'multiple-choice', 'true-false'

// --- Computed Properties ---
const allTags = computed(() => store.state.tags); // 所有標籤

const availableWordCount = computed(() => {
  let words = store.state.words;

  // Filter for direction first, as it's a hard requirement
  // 首先根據測驗方向過濾單字
  if (quizDirection.value === 'zh-to-en') {
      words = words.filter(word => word.definition && word.definition.trim() !== '');
  }

  // Then filter by unfamiliarity
  // 接著根據陌生度過濾
  words = words.filter(word => (word.unfamiliarity || 0) >= unfamiliarityLowerLimit.value);

  // Finally, filter by tags if any are selected
  // 最後，如果選擇了標籤，則根據標籤過濾
  if (selectedTags.value.length === 0) {
    return words.length;
  }
  const selectedTagSet = new Set(selectedTags.value);
  return words.filter(word =>
    word.tags && word.tags.some(tagId => selectedTagSet.has(tagId))
  ).length;
});

const isFormValid = computed(() => {
    // 檢查表單是否有效
    return questionCount.value > 0 && questionCount.value <= availableWordCount.value;
});

// --- Methods ---
const handleGenerateQuiz = async () => {
  // 處理產生考卷的邏輯
  if (!isFormValid.value) {
    alert(`題目數量（${questionCount.value}）無效或超過可選單字數量（${availableWordCount.value}）。`);
    return;
  }

  const config = {
    tags: selectedTags.value,
    count: questionCount.value,
    unfamiliarity: unfamiliarityLowerLimit.value,
    direction: quizDirection.value, // Pass direction to the action
    questionType: questionType.value // Pass the selected question type
  };

  console.log("正在產生考卷，設定如下：", config);

  try {
    await store.dispatch('generateQuiz', config);

    // 根據題目形式和考卷模式導航
    if (questionType.value === 'multiple-choice') {
      router.push('/quizChoice'); // 如果選擇選擇題，導向到 /quizChoice
    } else if (quizMode.value === 'print') {
        router.push('/quiz-print'); // 列印版
    } else { // 'online' mode (包括填空題和是非題的線上版)
        router.push('/quiz-run'); // 線上版
    }
  } catch (error) {
    alert(`產生考卷時發生錯誤：\n${error.message}`);
    console.error(error);
  }
};
</script>

<style scoped>
.card-header {
  background-color: rgba(0,0,0,0.03);
}
.tag-selection-container {
  background-color: #f8f9fa;
}
</style>
