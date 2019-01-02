<template>
    <v-ons-page>
        <v-ons-toolbar>
          <div class="left">
              <v-ons-back-button>Back</v-ons-back-button>
          </div>
          <div class="center">Tracked objects</div>
        </v-ons-toolbar>
          <div>
            <v-ons-pull-hook
                :action="loadObjects"
                @changestate="state = $event.state"
            >
                <span v-show="state === 'initial'"> Pull to refresh </span>
                <span v-show="state === 'preaction'"> Release </span>
                <span v-show="state === 'action'"> Loading... </span>
            </v-ons-pull-hook>

            <v-ons-list>
                <v-ons-list-header>Search</v-ons-list-header>
                <v-ons-list-item><v-ons-input placeholder="Search" float v-model="filterString"/></v-ons-list-item>
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
      searchTimeout: false
    };
  },
  mounted () {
    this.loadObjects(
      function () { }, false
    );
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
        const reformat = (data) => { if (data === null) return ''; return data.toLowerCase(); };
        this.$refs.loadingModal.show();
        let data = this.items.filter(function (x) {
          return reformat(x.TrackedObjectCode).indexOf(this.filterString) >= 0 || reformat(x.TrackedObjectName).indexOf(this.filterString) >= 0 ||
                 reformat(x.DeviceSerialNo).indexOf(this.filterString) >= 0 || reformat(x.SpeciesName_English).indexOf(this.filterString) >= 0 ||
                 reformat(x.DeviceSerialNo).indexOf(this.IndividualSex) >= 0 || reformat(x.CurrentAge).indexOf(this.filterString) >= 0;
        }.bind(this));
        this.$refs.loadingModal.hide();
        return data;
      }
      return this.items;
    }
  },
  methods: {
    loadObjects: function (done, forceReload) {
      const that = this;
      this.$refs.loadingModal.show();
      if (typeof (forceReload) === 'undefined') {
        forceReload = true;
      }
      const finished = function () {
        done();
        that.$refs.loadingModal.hide();
      };
      store.methods.trackedObjects.getTrackedObjects(function (err, data) {
        if (err) {
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
