import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import QuizPrint from '../views/QuizPrint.vue';
import QuizConfig from '../views/QuizConfig.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '單字列表' }
  },
  {
    path: '/quiz-config',
    name: 'QuizConfig',
    component: () => import('../views/QuizConfig.vue'),
    meta: { title: '考卷設定' }
  },
  {
    path: '/quiz-print',
    name: 'QuizPrint',
    component: () => import('../views/QuizPrint.vue'),
    meta: { title: '考卷預覽' }
  },
  {
    path: '/quiz-review',
    name: 'QuizReview',
    component: () => import('../views/QuizReview.vue'),
    meta: { title: '考卷批改' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '設定' }
  }
];

const router = createRouter({
  // 根據技術文件，我們使用 Hash 模式，這是部署到 GitHub Pages 最穩定的方式
  history: createWebHashHistory(),
  routes,
});

export default router;

