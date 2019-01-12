// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from '@/controllers/dataStore.js';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueLayers from 'vuelayers';
import 'vuelayers/lib/style.css'; // needs css-loader
import VueOnsen from 'vue-onsenui';

Vue.use(VueOnsen);
Vue.use(VueLayers, {
  dataProjection: 'EPSG:4326'
});

Vue.config.productionTip = false;

router.afterEach((to, from) => {
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
