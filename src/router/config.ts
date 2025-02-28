let routes = [
  {
    path: "/",
    name: "index",
    redirect: "/ragChat",
    meta: {
      isMenu: false,
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
  // {
  //   path: "/chat",
  //   name: "chat",
  //   component: () => import("@/view/chat/ChatView.vue"),
  //   meta: {
  //     isMenu: true,
  //     description: "AI对话",
  //     icon: "ChatDotRound",
  //   },
  // },
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
  // {
  //   path: "/manage",
  //   name: "manage",
  //   component: () => import("@/view/manage/ApiManageView.vue"),
  //   meta: {
  //     isMenu: true,
  //     description: "API管理",
  //     icon: "Key",
  //   },
  // },
  // {
  //   path: "/settings",
  //   name: "settings",
  //   component: () => import("@/view/chat/SettingView.vue"),
  //   meta: {
  //     isMenu: true,
  //     description: "设置",
  //     icon: "Setting",
  //   },
  // },
  // {
  //   path: "/rag",
  //   name: "rag",
  //   component: () => import("@/view/rag/RagView.vue"),
  //   meta: {
  //     isMenu: true,
  //     description: "RAG",
  //     icon: "PictureRounded",
  //   },
  // },

];

export default routes;
