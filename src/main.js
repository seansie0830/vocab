import { createApp } from 'vue'
import store from './store'
import router from './router'
import App from './App.vue'

// --- CSS Imports ---
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// --- FINAL FIX: Explicit JS Import ---
// As per your request, we are no longer using the 'bundle'.
// We import the main Bootstrap JavaScript file directly.
// Modern bundlers like Vite will automatically detect that Bootstrap
// requires @popperjs/core (which is installed) and handle it correctly.
// This is the cleanest way to ensure all JS plugins are available.
import 'bootstrap';

// Custom global styles
import './style.css'

const app = createApp(App)

app.use(store)
app.use(router)

store.dispatch('loadState');

app.mount('#app')
