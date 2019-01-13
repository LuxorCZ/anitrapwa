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
          <vl-view :min-zoom="3" :center="center" :zoom="zoom"></vl-view>
          <vl-layer-tile>
            <vl-source-xyz :tileLoadFunction="tileFunction" url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibHV4b3JjeiIsImEiOiJjamo4bnNyazgyb3M2M3dzMm15amthMDJuIn0.xDY8zfwOwMeR2wi3_nks_g"></vl-source-xyz>
          </vl-layer-tile>
          <vl-feature v-for="(point, index) in points" :key="point.Id" :properties="{time: point.t, isFirst: index === 0, displayLabel: displayLabels}">
            <vl-style-func :factory="styleFunction"/>
            <vl-geom-point :coordinates="[point.lng, point.lat]"></vl-geom-point>
          </vl-feature>
          <vl-feature v-if="points.length">
            <vl-geom-line-string :coordinates="getLine" />
          </vl-feature>
          <vl-feature v-if="hasUserPosition">
            <vl-style-func :factory="userPointStyleFunction"/>
            <vl-geom-point :coordinates="[userGpsPosition.longitude, userGpsPosition.latitude]"></vl-geom-point>
          </vl-feature>
      </vl-map>

    </v-ons-card>

    <v-ons-card>

      <div class="content">
        <v-ons-row>
          <v-ons-col><v-ons-icon icon="fa-paw"></v-ons-icon>&nbsp;{{ name }}</v-ons-col>
          <v-ons-col><v-ons-icon icon="fa-compass"></v-ons-icon>&nbsp;{{ distance }}</v-ons-col>
        </v-ons-row>
        <v-ons-row>
          <v-ons-col><v-ons-icon icon="fa-flag"></v-ons-icon>&nbsp;{{ country }}</v-ons-col>
          <v-ons-col><v-ons-icon icon="fa-time"></v-ons-icon>&nbsp;{{ lastData }}</v-ons-col>
        </v-ons-row>
      </div>

    </v-ons-card>

    <v-ons-card v-if="data">

      <div class="title">
        Actions
      </div>

      <div class="content">
        <v-ons-list>
          <v-ons-list-header>Display</v-ons-list-header>
          <v-ons-list-item tappable @click="toggleDisplayLabels">Toggle display labels</v-ons-list-item>
          <v-ons-list-item tappable @click="displayLastThirtyDays" v-if="data.lastPoints">Display last 30 days</v-ons-list-item>

          <v-ons-list-header>Download</v-ons-list-header>
          <v-ons-list-item tappable @click="handleDownloadLastPositions"><v-ons-icon icon="fa-check" v-if="hasPositionsDownloaded"></v-ons-icon>Last 30 days of TO</v-ons-list-item>
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
      center: [0, 0],
      rotation: false,
      displayLabels: false,
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
                color: feature.get('isFirst') ? 'green' : 'gold'
              })
            }),
            text: new Text({
              font: '13px Arial,sans-serif',
              text: ((feature.get('displayLabel') || feature.get('isFirst')) ? helper.formatTime(feature.get('time')) : ''),
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
      },
      userPointStyleFunction: function () {
        return function (feature) {
          const style = new Style({
            image: new Circle({
              radius: 4,
              stroke: new Stroke({
                color: 'white',
                width: 1
              }),
              fill: new Fill({
                color: 'blue'
              })
            })
          });
          return [style];
        };
      },
      userGpsPosition: {}
    };
  },
  mounted () {
    // const that = this;
    this.id = this.$route.params.id;
    this.loadTrackedObject();
    /* this.handleDownloadPreviewPositions(function () {
      if (that.points.length) {
      }
    }); */
    navigator.geolocation.getCurrentPosition(this.updatePosition, null, {
      enableHighAccuracy: true,
      timeout: 10000
    });
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
    },
    country: function () {
      return this.data.LastPositionCountry;
    },
    distance: function () {
      if (this.userGpsPosition) {
        const distance = this.getDistanceFromLastPoint({lat: this.userGpsPosition.latitude, lng: this.userGpsPosition.longitude});
        if (!distance) {
          return '';
        }
        if (distance < 3) {
          return (Math.round((distance * 1000) * 10000) / 10000) + ' m';
        }
        return (Math.floor((distance * 100)) / 100) + ' km';
      }
      return '...';
    },
    lastData: function () {
      console.log(this.data);
      return '';
    },
    hasPositionsDownloaded: function () {
      if (this.data.lastPoints) {
        return true;
      }
      return false;
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
        that.points = [];
        const lastPoint = that.getLastPoint();
        that.points.push(lastPoint);
        that.center = [lastPoint.lng, lastPoint.lat];
        that.loaded = true;
      });
    },
    handleDownloadLastPositions: function () {
      const that = this;
      store.methods.trackedObjects.getTrackedObjectTracks(this.id, true, true, constants.defaultTrackDays, constants.defaultMaxPositions, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }

        that.$set(that.data, 'lastPoints', data);
        that.$set(that.data, 'hasLastData', true);
        that.$ons.notification.toast('Data has been downloaded.', { timeout: 2000 });

        store.methods.trackedObjects.getTrackedObject(that.id, false, function (err, res) {
          if (err) {
            console.log(err);
            return;
          }
          res.lastPoints = data;
          res.hasLastData = true;
          store.methods.trackedObjects.saveTrackedObject(that.id, res);
        });
      });
    },
    handleDownloadPreviewPositions: function (callback) {
      const that = this;
      store.methods.trackedObjects.getTrackedObjectTracks(this.id, true, true, constants.defaultPreviewDays, constants.defaultPreviewPositions, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        console.log(data);
        that.points = data;
        that.data.hasRecentData = true;
        store.methods.trackedObjects.saveTrackedObject(that.id, that.data);
        callback();
      });
    },
    getLastPoint: function () {
      if (this.data.LastPositionLongitude && this.data.LastPositionLatitude) {
        return {lat: this.data.LastPositionLatitude, lng: this.data.LastPositionLongitude, t: this.data.LastPositionTime * 1000};
      }
    },
    updatePosition: function (pos) {
      this.userGpsPosition = pos.coords;
    },
    getDistanceFromLastPoint: function (pos) {
      const lastPoint = this.getLastPoint();
      if (lastPoint && pos) {
        // from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
        const p = 0.017453292519943295;
        var c = Math.cos;
        var a = 0.5 - c((lastPoint.lat - pos.lat) * p) / 2 + c(pos.lat * p) * c(lastPoint.lat * p) * (1 - c((lastPoint.lng - pos.lng) * p)) / 2;
        return 12742 * Math.asin(Math.sqrt(a));
      }
    },
    hasUserPosition: function () {
      return this.userGpsPosition.latitude && this.userGpsPosition.longitude;
    },
    toggleDisplayLabels: function () {
      this.displayLabels = !this.displayLabels;
    },
    displayLastThirtyDays: function () {
      console.log(this.data);
      if (this.data.lastPoints) {
        this.points = this.data.lastPoints;
      } else {
        this.$ons.notification.toast('You do not have this data downloaded yet!', { timeout: 2000 });
      }
    }
  }
};
</script>
