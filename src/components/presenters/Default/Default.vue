<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="center">Anitra</div>
    </v-ons-toolbar>
  </v-ons-page>
</template>

<script>

import store from '@/controllers/dataStore.js';

export default {
  mounted () {
    if (store.methods.user.isSignedIn()) {
      this.$router.push({name: 'home'});
    } else {
      this.$router.push({name: 'sign'});
    }
  }
};
</script>

<style>

</style>
