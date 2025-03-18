let routes = [
  {
    path: "/",
    name: "index",
    redirect: "/ragChat",
    meta: {
      isMenu: false,
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/view/login/RegisterLoginView.vue"),
    meta: {
      isMenu: true,
      requiresAuth: false,
      description: "个人中心",
      icon: "Avatar",
    },
  },
  {
    path: "/ragChat",
    name: "ragChat",
    component: () => import("@/view/ragChat/RagChatView.vue"),
    meta: {
      isMenu: true,
      description: "AI问答",
      icon: "ChatDotRound",
      requiresAuth: true,
    },
  },
  {
    path: "/draw",
    name: "draw",
    component: () => import("@/view/draw/DrawImageView.vue"),
    meta: {
      isMenu: true,
      description: "AI绘画",
      icon: "PictureRounded",
      requiresAuth: true,
    },
  },
  {
    path: "/know-hub",
    name: "knowHub",
    component: () => import("@/view/know/KnowHubView.vue"),
    meta: {
      isMenu: true,
      description: "我的知识库",
      icon: "Collection",
      requiresAuth: true,
    },
  },
  {
    path: "/user",
    name: "user",
    component: () => import("@/view/user/UserView.vue"),
    meta: {
      isMenu: true,
      description: "用户管理",
      icon: "UserFilled",
      requiresAuth: true,
      roles: ['admin']
    },
  },
  {
    path: "/logInfo",
    name: "logInfo",
    component: () => import("@/view/logInfo/LogInfoView.vue"),
    meta: {
      isMenu: true,
      description: "日志管理",
      icon: "List",
      requiresAuth: true,
      roles: ['admin']
    },
  },
  {
    path: "/sensitive",
    name: "sensitive",
    component: () => import("@/view/sensitive/SensitiveWordView.vue"),
    meta: {
      isMenu: true,
      description: "敏感词管理",
      icon: "WarnTriangleFilled",
      requiresAuth: true,
      roles: ['admin']
    },
  },
  {
    path: "/senCategory",
    name: "senCategory",
    component: () => import("@/view/sensitive/SenCategoryView.vue"),
    meta: {
      isMenu: true,
      description: "敏感词分类",
      icon: "menu",
      requiresAuth: true,
      roles: ['admin']
    },
  },
  {
    path: "/frequency",
    name: "frequency",
    component: () => import("@/view/frequency/WordFrequencyView.vue"),
    meta: {
      isMenu: true,
      description: "热点词分析",
      icon: "Histogram",
      requiresAuth: true,
      roles: ['admin']
    },
  },
];

export default routes;
