import Vue from 'vue';
import Router from 'vue-router';
import Sign from '@/components/presenters/Sign/Sign';
import Default from '@/components/presenters/Default/Default';
import Home from '@/components/presenters/Home/Home';
import TrackedObjectList from '@/components/presenters/TrackedObjects/List';

Vue.use(Router);

const authorization = function (to, from, next) {
  next();
};

// beforeEnter - https://github.com/vuejs/vue-router/blob/dev/examples/auth-flow/app.js
// https://github.com/frandiox/onsenui-vue-router/blob/master/src/App.vue
export default new Router({
  routes: [
    {
      path: '/sign',
      name: 'sign',
      component: Sign
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      beforeEnter: authorization,
      children: [
        {
          path: '/to',
          name: 'to',
          component: TrackedObjectList,
          beforeEnter: authorization
        }
      ]
    },
    {
      path: '/',
      name: 'default',
      component: Default
    }
  ]
});
