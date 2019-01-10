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
          <vl-view :min-zoom="3"></vl-view>
          <vl-layer-tile>
            <vl-source-xyz :tileLoadFunction="tileFunction" url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibHV4b3JjeiIsImEiOiJjamo4bnNyazgyb3M2M3dzMm15amthMDJuIn0.xDY8zfwOwMeR2wi3_nks_g"></vl-source-xyz>
          </vl-layer-tile>
          <vl-feature v-for="point in points" :key="point.Id" :properties="{time: point.t, prop2: 'value'}">
            <vl-style-func :factory="styleFunction"/>
            <vl-geom-point :coordinates="[point.lng, point.lat]"></vl-geom-point>
          </vl-feature>
          <vl-feature v-if="points.length">
            <vl-geom-line-string :coordinates="getLine" />
          </vl-feature>
      </vl-map>

      <div class="title">
        Actions
      </div>

      <div class="content">
        <tracked-object-detail :data="data"/>
        <v-ons-list>
          <v-ons-list-header>Download</v-ons-list-header>
          <v-ons-list-item tappable @click="handleDownloadLastPositions">Last 30 days of TO</v-ons-list-item>
          <v-ons-list-item tappable>Map around last position</v-ons-list-item>
        </v-ons-list>
      </div>
    </v-ons-card>

    </v-ons-page>
</template>

<script>

import store from '@/controllers/dataStore.js';
import helper from '@/helpers/trackedObjects.js';
import TileState from 'ol/TileState';
import {Fill, Stroke, Style, Circle, Text} from 'ol/style.js'; // Text,
import TrackedObjectDetail from './subcomponents/TrackedObjectDetail.vue';
import constants from '@/common/constants.js';

export default {
  components: {
    TrackedObjectDetail
  },
  data () {
    return {
      data: {},
      id: null,
      loaded: false,
      zoom: 3,
      center: [50, 14],
      rotation: false,
      tileFunction: function (tile, src) {
        const coords = tile.getTileCoord();
        store.methods.maps.getTile(coords[1], coords[2], coords[0], function (err, data) {
          if (err || typeof (data) === 'undefined') {
            tile.setState(TileState.ERROR);
            return;
          }
          tile.getImage().src = URL.createObjectURL(data);
        });
      },
      points: [],
      styleFunction: function () {
        return function (feature) {
          const style = new Style({
            image: new Circle({
              radius: 6,
              stroke: new Stroke({
                color: 'white',
                width: 2
              }),
              fill: new Fill({
                color: 'green'
              })
            }),
            text: new Text({
              font: '13px Arial,sans-serif',
              text: helper.formatTime(feature.get('time')),
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 3
              }),
              offsetX: 30,
              offsetY: 15
            })
          });
          return [style];
        };
      }
    };
  },
  mounted () {
    this.id = this.$route.params.id;
    this.loadTrackedObject();
    this.handleDownloadPreviewPositions();
  },
  computed: {
    name: function () {
      return helper.getTrackedObjectName(this.data);
    },
    getLine: function () {
      const res = this.points.map(function (point) {
        return [point.lng, point.lat];
      });
      return res;
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
        console.log(data);
        that.loaded = true;
      });
    },
    handleDownloadLastPositions: function () {
      const that = this;
      store.methods.trackedObjects.getTrackedObjectTracks(this.id, true, true, constants.defaultTrackDays, constants.defaultMaxPositions, function (err, data) {
        if (err) {
          console.log(err);
        }
        that.points = data;
      });
    },
    handleDownloadPreviewPositions: function () {
      const that = this;
      store.methods.trackedObjects.getTrackedObjectTracks(this.id, true, true, constants.defaultPreviewDays, constants.defaultPreviewPositions, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        that.points = data;
      });
    }
  }
};
</script>
