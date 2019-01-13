<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="center">Anitra</div>
    </v-ons-toolbar>
    <v-ons-list>
      <v-ons-list-header>Navigation</v-ons-list-header>
      <v-ons-list-item tappable modifier="longdivider" @click="navigateTrackedObjects">
        <div class="left">
          <v-ons-icon icon="fa-paw" class="list-item__icon main-menu-icon-purple"></v-ons-icon>
        </div>
        <div class="center">
          Tracked objects
        </div>
      </v-ons-list-item>

      <v-ons-list-item tappable modifier="longdivider" @click="navigateSettings">
        <div class="left">
          <v-ons-icon icon="fa-wrench" class="list-item__icon main-menu-icon-yellow"></v-ons-icon>
        </div>
        <div class="center">
          Settings
        </div>
      </v-ons-list-item>

    </v-ons-list>
  </v-ons-page>
</template>

<script>
export default {
  key: 'home',
  name: 'Home',
  mounted () {
    console.log('mounted');
  },
  methods: {
    navigateTrackedObjects: function () {
      this.$router.push({ name: 'to' });
    },
    navigateSettings: function () {
      this.$router.push({ name: 'settings' });
    }
  }
};
</script>

<style>
    .main-menu-icon-purple {
        padding: 20%;
        border: 1px solid rgb(88,86,214);
        border-radius: 5px;
        background-color: rgb(88,86,214);
        color: #fff;
    }
    .main-menu-icon-yellow {
        padding: 20%;
        border: 1px solid rgb(255,204,0);
        border-radius: 5px;
        background-color: rgb(255,204,0);
        color: #fff;
    }
</style>
