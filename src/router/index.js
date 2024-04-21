import { createRouter, createWebHistory } from 'vue-router'
import NounView from '../views/NounView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'noun',
      component: NounView
    },
    {
      path: '/verb',
      name: 'verb',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/VerbView.vue')
    },
    {
      path: '/simple-sentence',
      name: 'simple-sentence',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/SimpleSentenceView.vue')
    },
    {
      path: '/a1-wordlist',
      name: 'a1-wordlist',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/A1WordList.vue')
    }
  ]
})

export default router
