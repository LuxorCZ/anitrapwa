<template>
    <v-ons-page>
        <v-ons-list>
        <v-ons-list-item>
            <an-logo/>
        </v-ons-list-item>
        <v-ons-list-item>
            <div class="center">
                Sign in
            </div>
        </v-ons-list-item>
        <v-ons-list-item>
            <ons-row vertical-align="center">
                <ons-col width="10%" style="text-align:center">
                    <label for="username" class="mr-3"><v-ons-icon icon="fa-envelope"></v-ons-icon></label>
                </ons-col>
                <ons-col width="90%">
                    <v-ons-input input-id="username" float placeholder="E-mail" type="email" v-model="username"></v-ons-input>
                </ons-col>
            </ons-row>
        </v-ons-list-item>
        <v-ons-list-item>
            <ons-row vertical-align="center">
                <ons-col width="10%"  style="text-align:center">
                    <label for="password" class="mr-3"><v-ons-icon icon="fa-key"></v-ons-icon></label>
                </ons-col>
                <ons-col width="90%">
                    <v-ons-input input-id="password" float placeholder="Password" type="password" v-model="password"></v-ons-input>
                </ons-col>
            </ons-row>
        </v-ons-list-item>
        <v-ons-list-item>
            <div v-if="isLoading" class="wrapper">
                <ons-button modifier="large" disabled>Sign in</ons-button>
            </div>
            <div v-else class="wrapper">
                <ons-button modifier="large" @click="signIn">Sign in</ons-button>
            </div>
        </v-ons-list-item>
        </v-ons-list>
        <login-modal ref="loginModal"/>
  </v-ons-page>
</template>

<script>

import Logo from '@/components/generic/logo/Logo';
import LoginModal from '@/components/generic/login-modal/LoginModal';
import store from '@/controllers/dataStore.js';

export default {
  name: 'sign',
  components: {
    'an-logo': Logo,
    'login-modal': LoginModal
  },
  props: {
  },
  mounted () {
    const msg = store.methods.generic.getNotification();
    if (msg) {
      this.$ons.notification.toast(msg);
    }
  },
  data () {
    return {
      isLoading: false,
      username: '',
      password: ''
    };
  },
  methods: {
    signIn: function () {
      if (!this.username || !this.password) {
        this.$ons.notification.alert('Please fill in the username and password.');
        return;
      }
      const that = this;
      this.$refs.loginModal.show();
      this.isLoading = true;
      store.apiActions.user.signIn(this.username, this.password, function (err, data) {
        if (err) {
          that.$ons.notification.alert(err);
          that.isLoading = false;
          that.$refs.loginModal.hide();
          return;
        }
        if (data) {
          that.$ons.notification.toast(data);
        }
        that.$router.push({ name: 'home' });
      });
    }
  }
};
</script>
