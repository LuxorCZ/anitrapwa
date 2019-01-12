<template>
  <v-ons-page id="app">
      <v-ons-navigator swipeable swipe-target-width="30px"
        :page-stack="pageStack"
        :pop-page="goBack"
      ></v-ons-navigator>
  </v-ons-page>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      pageStack: []
    };
  },
  methods: {
    goBack () {
      // this.$router.push({ name: this.$route.matched[this.$route.matched.length - 2].name });
      this.$router.go(-1); // Could work but might be misleading in some situations
    }
  },
  created () {
    /* eslint-disable */
    const mapRouteStack = route => this.pageStack = route.matched.map(m => m.components.default);
    /* eslint-enable */
    mapRouteStack(this.$route);
    this.$router.beforeEach((to, from, next) => mapRouteStack(to) && next());
  }
};
</script>

<style>
  .mr-3 {
    margin-right: 3%;
  }

  ons-input
  {
    width: 100%;
  }

  .wrapper {
    width: 100%;
  }

</style>
