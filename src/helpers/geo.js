/* eslint-disable */
/* source: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2 */
function long2tile (lon, zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile (lat, zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

export default function (lat, lng, zoom) {
  return {x: long2tile(lng, zoom), y: lat2tile(lat, zoom)};
};
