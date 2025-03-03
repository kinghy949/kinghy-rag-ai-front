import { createRouter, createWebHistory } from "vue-router";
import routes from "./config";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // 检查是否有登录token
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 如果需要登录但未登录，重定向到登录页
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
