import { createRouter, createWebHistory } from "vue-router";
import routes from "./config";
import {ElMessage} from "element-plus";

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // 获取 token
  const userRole = localStorage.getItem('userRole'); // 获取用户角色

  if (to.meta.requiresAuth) {
    if (!token) {
      // 如果目标路由需要认证且没有 token，则显示提示信息并重定向到登录页
      ElMessage({ message: '请先登录', type: 'warning' });
      next({ name: 'login' });
    } else if (to.meta.roles && Array.isArray(to.meta.roles) && !to.meta.roles.includes(userRole)) {
      // 如果目标路由需要特定角色且用户角色不符合要求，则显示提示信息并重定向到首页
      ElMessage({ message: '您没有权限访问该页面', type: 'error' });
      next({ name: 'index' });
    } else {
      // 否则继续导航
      next();
    }
  } else {
    // 如果目标路由不需要认证，则继续导航
    next();
  }
});

export default router;
