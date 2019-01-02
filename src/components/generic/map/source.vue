<script>

import XYZSource from 'ol/source/XYZ';
import tilesource from 'vuelayers/mixin/tile-source';

export default {
  name: 'vl-source-anitra',
  data: {
    url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/512/1/1/0@2x?access_token=pk.eyJ1IjoibHV4b3JjeiIsImEiOiJjamo4bnNyazgyb3M2M3dzMm15amthMDJuIn0.xDY8zfwOwMeR2wi3_nks_g',
    minZoom: 1,
    maxZoom: 20
  },
  methods: {
    createSource () {
      return new XYZSource({
        cacheSize: this.cacheSize,
        layer: this.layer,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        /* tileLoadFunction: this.tileLoadFunction, */
        url: this.url,
        wrapX: true
      });
    }
  }
};
</script>
