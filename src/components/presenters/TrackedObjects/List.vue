<template>
    <v-ons-page>
        <v-ons-toolbar>
          <div class="left">
              <v-ons-back-button>Back</v-ons-back-button>
          </div>
          <div class="center">Tracked objects</div>
          <div class="right">
              <v-ons-toolbar-button icon="fa-refresh" @click="reloadObjectsManually"></v-ons-toolbar-button>
          </div>
        </v-ons-toolbar>
          <div>
            <v-ons-list>
                <v-ons-list-header>Search</v-ons-list-header>
                <v-ons-list-item><v-ons-input placeholder="Search" float v-model="filterString" :disabled="isLoading"/></v-ons-list-item>
                <v-ons-list-header>Tracked objects</v-ons-list-header>
                <list-detail :key="item.TrackedObjectId" v-for="item in itemsFiltered" :data="item" :to-id="item.TrackedObjectId"/>
            </v-ons-list>
        </div>
    <loading-modal ref="loadingModal"/>
    </v-ons-page>
</template>

<script>

import store from '@/controllers/dataStore.js';
import LoadingModal from '@/components/generic/loading-modal/LoadingModal';
import ListDetail from './ListDetail.vue';

export default {
  name: 'to',
  key: 'to',
  components: {
    'loading-modal': LoadingModal,
    'list-detail': ListDetail
  },
  data () {
    return {
      items: [],
      state: '',
      search: '',
      searchTimeout: false,
      isLoading: false
    };
  },
  mounted () {
    this.loadObjects(false);
  },
  computed: {
    filterString: {
      get () {
        return this.search;
      },
      set (value) {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(function () { this.search = value; this.searchTimeout = false; }.bind(this), 600);
      }
    },
    itemsFiltered: function () {
      if (this.filterString !== '') {
        const reformat = (data) => {
          if (!data) return '';
          if (typeof data !== 'string') {
            return '' + data;
          }
          return data.toLowerCase();
        };
        this.$refs.loadingModal.show();
        let data = this.items.filter(function (x) {
          return reformat(x.TrackedObjectCode).indexOf(this.filterString) >= 0 || reformat(x.TrackedObjectName).indexOf(this.filterString) >= 0 ||
                 reformat(x.DeviceSerialNo).indexOf(this.filterString) >= 0 || reformat(x.SpeciesName_English).indexOf(this.filterString) >= 0 ||
                 reformat(x.IndividualSex).indexOf(this.filterString) >= 0 || reformat(x.CurrentAge).indexOf(this.filterString) >= 0;
        }.bind(this));
        this.$refs.loadingModal.hide();
        return data;
      }
      return this.items;
    },
    scrolledTop: function () {
      return window.scrollY === 0;
    }
  },
  methods: {
    reloadObjectsManually: function () {
      const that = this;
      this.$ons.notification.confirm('Do you really want to reload all data?').then((response) => {
        if (response) {
          that.loadObjects(true);
        }
      });
    },
    loadObjects: function (forceReload) {
      const that = this;
      this.$refs.loadingModal.show();
      this.isLoading = true;

      if (typeof (forceReload) === 'undefined') {
        forceReload = true;
      }

      if (!store.methods.generic.isOnline() && forceReload) {
        this.$ons.notification.toast('You are offline.', { timeout: 2000 });
        this.isLoading = false;
      }

      const finished = function () {
        that.$refs.loadingModal.hide();
        that.isLoading = false;
      };

      store.methods.trackedObjects.getTrackedObjects(function (err, data) {
        if (err) {
          that.$ons.notification.toast(err, { timeout: 2000 });
          finished();
          return;
        }
        that.items = data;
        finished();
      }, forceReload);
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
