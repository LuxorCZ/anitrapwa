<template>
    <v-ons-page>
        <v-ons-toolbar>
            <div class="left">
                <v-ons-back-button>Back</v-ons-back-button>
            </div>
            <div class="center">{{ name }}</div>
        </v-ons-toolbar>

    <v-ons-card>

      <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
          <vl-view></vl-view>
          <vl-layer-tile>
            <vl-source-xyz :tileLoadFunction="tileFunction" url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibHV4b3JjeiIsImEiOiJjamo4bnNyazgyb3M2M3dzMm15amthMDJuIn0.xDY8zfwOwMeR2wi3_nks_g"></vl-source-xyz>
          </vl-layer-tile>
      </vl-map>

      <div class="title">
        Awesome framework
      </div>

      <div class="content">
        <v-ons-list>
          <v-ons-list-header>Download</v-ons-list-header>
          <v-ons-list-item>Complete track and positions</v-ons-list-item>
          <v-ons-list-item>Last 30 days of TO</v-ons-list-item>
          <v-ons-list-item>Map around last position</v-ons-list-item>
        </v-ons-list>
      </div>
    </v-ons-card>

    </v-ons-page>
</template>

<script>

import store from '@/controllers/dataStore.js';
import helper from '@/helpers/trackedObjects.js';
import TileState from 'ol/TileState';

export default {
  data () {
    return {
      data: {},
      id: null,
      loaded: false,
      zoom: false,
      center: false,
      rotation: false,
      tileFunction: function (tile, src) {
        const coords = tile.getTileCoord();
        console.log(tile.getTileCoord());
        store.methods.maps.getTile(coords[1], coords[2], coords[0], function (err, data) {
          if (err) {
            tile.setState(TileState.ERROR);
            return;
          }
          tile.getImage().src = URL.createObjectURL(data);
        });
      }
    };
  },
  mounted () {
    this.id = this.$route.params.id;
    this.loadTrackedObject();
  },
  computed: {
    name: function () {
      return helper.getTrackedObjectName(this.data);
    }
  },
  methods: {
    loadTrackedObject: function () {
      const that = this;
      store.methods.trackedObjects.getTrackedObject(this.id, false, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        that.data = data;
        that.loaded = true;
      });
    }
  }
};
</script>
