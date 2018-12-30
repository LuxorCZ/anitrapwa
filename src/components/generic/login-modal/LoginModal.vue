<template>
    <v-ons-modal :visible="isVisible">
      <p style="text-align: center">
        Signing in <v-ons-icon icon="fa-spinner" spin></v-ons-icon>
      </p>
    </v-ons-modal>
</template>


<script>
export default {
  name: 'LoginModal',
  data () {
    return {
      isVisible: false
    };
  },
  methods: {
    show: function () {
      this.isVisible = true;
    },
    hide: function () {
      this.isVisible = false;
    }
  }
};
</script>
