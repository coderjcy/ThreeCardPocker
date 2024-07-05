import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: '登录',
      component: () => import('@/views/login/index.vue')
    },
    {
      path: '/sign-up',
      name: '注册',
      component: () => import('@/views/sign-up/index.vue')
    },
    {
      path: '/room',
      name: '房间',
      children: [
        {
          path: 'list',
          name: '房间列表',
          component: () => import('@/views/room/list/index.vue')
        },
        {
          path: 'in/:roomId',
          name: '游戏房间',
          component: () => import('@/views/room/in/index.vue')
        }
      ]
    }
  ]
})
router.beforeEach((to, from) => {
  if (to.path === '/') return '/login'
  if (to.path === '/login') return
  const token = localStorage.getItem('token')
  if (!token) return '/login'
})
export default router
