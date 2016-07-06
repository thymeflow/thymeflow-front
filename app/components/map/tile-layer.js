import BaseLayer from "./base-layer";
import ol from "ol";

export default BaseLayer.extend({

  openlayersRequiredOptions: [
    'source'
  ],

  openlayersOptions: [
    'extent', 'maxResolution', 'minResolution', 'opacity', 'preload', 'source', 'useInterimTilesOnError', 'visible', 'zIndex'
  ],

  openlayersEvents: [
    'postcompose', 'precompose', 'render'
  ],

  openlayersProperties: [
    'extent', 'maxResolution', 'minResolution', 'opacity', 'preload', 'source', 'useInterimTilesOnError', 'visible', 'zIndex'
  ],

  source: null,

  createLayer() {
    let options = this.get('options');
    return new ol.layer.Tile(options);
  }
});