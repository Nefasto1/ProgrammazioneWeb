import { createRouter, createWebHashHistory } from 'vue-router'
import feed from '../views/feed.vue'
import signinup from '../views/signinup.vue'
import whoami from '../views/whoami.vue'
import users from '../views/users.vue'
import message from '../views/message.vue'
import followers from '../views/followers.vue'
import post from '../views/post.vue'

const routes = [
  {
    path: '/',
    name: 'feed',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: feed
  },
  {
    path: '/signinup',
    name: 'signinup',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: signinup
  },
  {
    path: '/whoami',
    name: 'whoami',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: whoami
  },
  {
    path: '/users/:id',
    name: 'users',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: users
  },
  {
    path: '/message/:userID/:msgID',
    name: 'message',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: message
  },
  {
    path: '/followers/:id',
    name: 'followers',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: followers
  },
  {
    path: '/post',
    name: 'post',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: post
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
