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
      description: "登录",
      icon: "Collection",
    },
  },
  {
    path: "/ragChat",
    name: "ragChat",
    component: () => import("@/view/ragChat/RagChatView.vue"),
    meta: {
      isMenu: true,
      description: "RagChat",
      icon: "ChatDotRound",
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
    },
  },
];

export default routes;
