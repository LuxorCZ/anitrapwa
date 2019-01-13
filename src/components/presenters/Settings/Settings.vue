<template>
  <v-ons-page>

    <v-ons-toolbar>
        <div class="left">
            <v-ons-back-button>Back</v-ons-back-button>
        </div>
        <div class="center">Settings</div>
    </v-ons-toolbar>

    <v-ons-card>


      <v-ons-row>
        <v-ons-col width="50px"><div class="profile"><v-ons-icon icon="fa-user"></v-ons-icon></div></v-ons-col>
        <v-ons-col><span style="username">{{ username }}</span></v-ons-col>
      </v-ons-row>


      <div class="content">
        <v-ons-list>
          <v-ons-list-header>User</v-ons-list-header>
          <v-ons-list-item tappable @click="signOut">Sign out</v-ons-list-item>
        </v-ons-list>
      </div>

    </v-ons-card>


    <v-ons-card>
      <div class="title">
        Storage
      </div>
      <div class="progressbar-wrapper" v-if="storage">
        <div class="progress">
          <div class="bar" :style="{width: (storage * 100) + '%'}">
        </div>
        </div>
        {{ storage * 100 }} %
      </div>
      <div v-else>
        Loading...
      </div>
    </v-ons-card>

  </v-ons-page>
</template>

<style>

  .progressbar-wrapper {
    width: 100%;
    text-align: center;
  }

  .progress {
    background-color: #ffeded;
  }

  .bar {
    background-color: red;
    height: 20px;
  }

  .profile {
    height: 30px;
    background-color: #ccc;
    border-radius: 100%;
    width: 30px;
    text-align: center;
    line-height: 30px;
    margin-bottom: 15px;
  }

  .username {
    font-weight: bold;
  }

</style>

<script>

import store from '@/controllers/dataStore.js';

export default {
  data () {
    return {
      storage: false,
      username: ''
    };
  },
  mounted () {
    this.getStorageEstimate();
    this.username = store.methods.user.getUsername();
  },
  methods: {
    getStorageEstimate: function () {
      const that = this;
      return store.methods.generic.getStorageEstimate(function (err, data) {
        if (!err) {
          that.storage = data;
        }
      });
    },
    signOut: function () {
      const router = this.$router;
      this.$ons.notification.confirm('Do you really want to sign out').then((response) => {
        if (response) {
          store.methods.user.signOut(function (err, data) {
            if (err) {
              return;
            }
            router.push({ name: 'sign' });
          });
        }
      });
    }
  }
};
</script>
