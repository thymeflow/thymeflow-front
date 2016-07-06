import TileLayer from "./tile-layer";
import ol from "ol";

export default TileLayer.extend({

  url: null,
  attributionHtml: '',

  source: function () {
    return new ol.source.XYZ({
      url: this.get('url'),
      attributions: [new ol.Attribution({html: [this.get('attributionsHtml')]})]
    });
  }.property(),

});