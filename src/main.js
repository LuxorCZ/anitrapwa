// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from '@/controllers/dataStore.js';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import VueOnsen from 'vue-onsenui';

// (3) And plug in the bindings
Vue.use(VueOnsen);

Vue.config.productionTip = false;

router.afterEach((to, from) => {
  console.log('from', from);
  console.log('to', to);
  store.methods.user.verifySignOn(router);
});

store.init();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});
