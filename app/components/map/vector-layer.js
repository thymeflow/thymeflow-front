import Ember from "ember";
import BaseLayer from "./base-layer";
import ol from "ol";

const format = new ol.format.WKT();

export default BaseLayer.extend({

  content: null,
  targetCrs: 'EPSG:3857',
  geometryPath: 'geometry',
  features: (function () {
    const crs = this.get('crs');
    const geometryPath = this.get('geometryPath');
    const content = this.get('content');
    const containerLayerCrs = this.get('containerLayer.crs');
    if (content != null) {
      return content.map(function (geoObject) {
        var geometry;
        geometry = Ember.get(geoObject, geometryPath);
        geometry = geometry instanceof ol.geom.Geometry ? geometry : format.readGeometry(geometry);
        geometry = containerLayerCrs === crs ? geometry : geometry.clone().transform(crs, containerLayerCrs);
        return new ol.Feature({
          geometry: geometry,
          data: geoObject
        });
      });
    } else {
      return [];
    }
  }).property('content'),
  clusterDistance: 0,
  clusterSource: (function () {
    const features = this.get('features');
    if (features != null) {
      return new ol.source.Vector({
        features: features
      });
    } else {
      return null;
    }
  }).property(),
  source: (function () {
    const clusterDistance = this.get('clusterDistance');
    const clusterSource = this.get('clusterSource');
    return (clusterDistance > 0 && clusterSource != null) ? new ol.source.Cluster({
      distance: clusterDistance,
      source: clusterSource
    }) : clusterSource;
  }).property(),
  openlayersRequiredOptions: [
    'source'
  ],

  openlayersOptions: [
    'extent', 'minResolution', 'maxResolution', 'opacity', 'source', 'style', 'visible', 'zIndex', 'name',
    // experimental
    'renderBuffer', 'updateWhileAnimating', 'updateWhileInteracting'
  ],

  openlayersEvents: [
    'postcompose', 'precompose', 'render'
  ],

  openlayersProperties: [
    'extent', 'minResolution', 'maxResolution', 'opacity', 'source', 'style', 'visible', 'zIndex'
  ],

  createLayer() {
    let options = this.get('options');
    return new ol.layer.Vector(options);
  },
  getExtent() {
    const clusterSource = this.get('clusterSource');
    if (clusterSource != null) {
      return clusterSource.getExtent();
    } else {
      return null;
    }
  },
  _updateSourceOnContentChange: function () {
    const clusterSource = this.get('clusterSource');
    if (clusterSource != null) {
      clusterSource.clear();
      clusterSource.addFeatures(this.get('features'));
    }
    this.sendOnSourcePopulated();
  }.observes('content'),
  sendOnSourcePopulated: function() {
    if (this.get('content') != null) {
      this.sendAction('onSourcePopulated', this.get('containerLayer'), this);
    }
  },
  didCreateLayer: function(){
    this.sendOnSourcePopulated();
  }
});