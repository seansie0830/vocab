<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-card-checklist me-2"></i>
        單字記憶超人
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
            <router-link class="nav-link" active-class="active" to="/quiz">產生考卷</router-link>
          </li>
        </ul>
        <!-- NEW: Add the Import/Export component here -->
        <ImportExport />
      </div>
    </div>
  </nav>
</template>

<script setup>
// Import the new component
import ImportExport from './ImportExport.vue';
</script>

<style scoped>
/* Styles for the header component */
.navbar-brand {
  font-weight: bold;
}
</style>
