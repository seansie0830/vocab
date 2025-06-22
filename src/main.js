    import { createApp } from 'vue'
    // 1. 引入 Bootstrap 的 CSS 檔案
    import 'bootstrap/dist/css/bootstrap.min.css'
    import 'bootstrap-icons/font/bootstrap-icons.css' 
    import './style.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

    import App from './App.vue'
    import store from './store'
    import router from './router'
    import storage from './services/storage'

    if (import.meta.env.DEV) {
      console.log('Development mode: attaching services to window for debugging.');
      window.storage = storage;
      window.store = store;
    }

    const app = createApp(App)

    app.use(store)
    app.use(router)

    store.dispatch('initializeApp');

    app.mount('#app')
    
