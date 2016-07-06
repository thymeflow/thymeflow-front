import BaseLayer from "./base-layer";
import ol from "ol";

export default BaseLayer.extend({
  tagName: 'div',

  crs: 'EPSG:3857',

  openlayersRequiredOptions: [
    'position'
  ],

  openlayersOptions: [
    'offset', 'position', 'positioning', 'stopEvent', 'insertFirst',
    // experimental
    'autoPan', 'autoPanAnimation', 'autoPanMargin'
  ],

  openlayersProperties: [
    'offset', 'position', 'positioning'
  ],

  position: function () {
    const containerLayerCrs = this.get('containerLayer.crs');
    const crs = this.get('crs');
    const coordinate = this.get('coordinate');
    if (coordinate != null) {
      if (containerLayerCrs === crs) {
        return coordinate;
      } else {
        return ol.proj.transform(coordinate, crs, containerLayerCrs);
      }
    } else {
      return null;
    }
  }.property('coordinate'),

  createLayer() {
    let options = this.get('options');
    options.element = this.get('element');
    return new ol.Overlay(options);
  }
});