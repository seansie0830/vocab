    import { createRouter, createWebHashHistory } from 'vue-router';
    import Home from '../views/Home.vue';
    import QuizPrint from '../views/QuizPrint.vue';

    const routes = [
      {
        path: '/',
        name: 'Home',
        component: Home,
      },
      {
        path: '/quiz',
        name: 'QuizPrint',
        component: QuizPrint,
      },
    ];

    const router = createRouter({
      // 根據技術文件，我們使用 Hash 模式，這是部署到 GitHub Pages 最穩定的方式
      history: createWebHashHistory(),
      routes,
    });

    export default router;
    
