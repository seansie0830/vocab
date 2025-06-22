<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container-fluid">
      <!-- Logo 與品牌名稱 -->
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-card-checklist me-2"></i>
        <strong>單字記憶工具</strong>
      </router-link>

      <!-- RWD 的關鍵：漢堡按鈕 -->
      <!-- data-bs-toggle 和 data-bs-target 是 Bootstrap JS 需要的屬性 -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 所有會被收合的內容，都放在這個 div 裡面 -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <!-- 導覽連結 -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <!-- 使用 router-link 進行 SPA 內部導航，並設定 active-class -->
            <router-link to="/" class="nav-link" active-class="active">
              <i class="bi bi-house-door me-1"></i>首頁
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/quiz" class="nav-link" active-class="active">
              <i class="bi bi-printer me-1"></i>測驗列印
            </router-link>
          </li>
        </ul>

        <!-- 右側的按鈕 -->
        <div class="d-flex">
          <button class="btn btn-success" type="button">
            <i class="bi bi-box-arrow-down me-1"></i>
            匯入/匯出
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppHeader',
};
</script>

<!-- 我們不再需要這個元件獨立的 style，因為已在 main.js 中全域引入 -->

