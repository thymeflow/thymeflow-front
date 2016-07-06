import TileLayer from "./tile-layer";
import ol from "ol";

export default TileLayer.extend({
  source: function () {
    return new ol.source.OSM();
  }.property()
});