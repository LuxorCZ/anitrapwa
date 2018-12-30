<template>
    <img :src="logo" alt="Anitra" class="an-logo">
</template>

<script>

import logo from '../../../assets/logo/anitra.svg';

export default {
  name: 'Logo',
  data () {
    return {
      logo: logo
    };
  }
};
</script>

<style>
.an-logo {
    margin: auto;
    max-height: 250px;
    background: linear-gradient(25deg, #97f6bd, #fafff2);
    border-radius: 15px;
}
</style>
