import XYZTileLayer from "./xyz-tile-layer";
import ol from "ol";

// const HTTP_CARTODB_URL = "http://{a-z}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
const HTTPS_CARTODB_URL = "https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png";
const CARTO_DB_ATTRIBUTIONS_HTML = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

export default XYZTileLayer.extend({
  sourceUrl: HTTPS_CARTODB_URL,
  sourceAttributionHtml: CARTO_DB_ATTRIBUTIONS_HTML,

  source: function () {
    return new ol.source.XYZ({
      url: this.get('sourceUrl'),
      attributions: [new ol.Attribution({html: [this.get('sourceAttributionHtml')]})]
    });
  }.property()
});