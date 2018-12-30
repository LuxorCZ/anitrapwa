<template>
    <v-ons-list-item tappable modifier="longdivider">
        <div class="left">
          <v-ons-icon icon="fa-paw" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
            {{name}} ({{species}} {{age}} {{sex}})
        </div>
        <div class="right">
          <v-ons-button>
            <ons-icon icon="chevron-right"></ons-icon>
          </v-ons-button>
        </div>
    </v-ons-list-item>
</template>


<script>
import trackedObjectUtils from '@/helpers/trackedObjects.js';
export default {
  name: 'TrackedObjectListDetail',
  props: ['data'],
  computed: {
    name: function () {
      if (!this.data.TrackedObjectName) {
        return this.data.TrackedObjectCode;
      }
      return this.data.TrackedObjectName;
    },
    sex: function () {
      return trackedObjectUtils.getTrackedObjectSex(this.data.IndividualSex);
    },
    age: function () {
      return trackedObjectUtils.getTrackedObjectAge(this.data.CurrentAge);
    },
    species: function () {
      return trackedObjectUtils.getTrackedObjectSpecies(this.data.SpeciesName_English);
    }
  }
};
</script>
