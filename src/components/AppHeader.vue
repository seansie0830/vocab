<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark" style="position: fixed; top: 0; width: 100%; z-index: 1030;">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-card-checklist me-2"></i>
        單字記憶工具
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/">單字列表</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/quiz-config">產生考卷</router-link>
          </li>
        </ul>
        <!-- MODIFIED: Replaced the old component with a link to the new settings page -->
        <ul class="navbar-nav">
           <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/settings">
              <i class="bi bi-gear-fill"></i><span class="d-lg-none ms-2">設定</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
// The ImportExport component is no longer needed here, so the import is removed.
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
}
</style>