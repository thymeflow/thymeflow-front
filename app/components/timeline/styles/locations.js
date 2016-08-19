import Ember from 'ember';
import ol from 'ol';

export default Ember.Object.extend({
  normalStyle: new ol.style.Circle({
    radius: 2,
    fill: new ol.style.Fill({
      color: "#57b9d1"
    }),
    stroke: new ol.style.Stroke({
      color: "#0c262c",
      width: 1
    })
  }),
  selectedStyle: new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({
      color: "#0c262c"
    }),
    stroke: new ol.style.Stroke({
      color: "#040e10",
      width: 1
    })
  }),
  accuracyStrokeStyle: new ol.style.Stroke({
      color: "#040e10",
      width: 1
    }),
  deselectedStyle: new ol.style.Circle({
    radius: 2,
    fill: new ol.style.Fill({
      color: "#57b9d1"
    }),
    stroke: new ol.style.Stroke({
      color: "#0c262c",
      width: 1
    })
  }),
  filterLocationInterval: Ember.K,
  showLocationAccuracy: Ember.K,
  style: (function() {
    const normalStyle = new ol.style.Style({
      image: this.get('normalStyle')
    });
    const selectedStyle = new ol.style.Style({
      image: this.get('selectedStyle')
    });
    const deselectedStyle = new ol.style.Style({
      image: this.get('deselectedStyle')
    });
    const accuracyStrokeStyle = this.get('accuracyStrokeStyle');
    function accuracyStyle(feature, accuracy) {
      return new ol.style.Style({
        geometry: new ol.geom.Circle(feature.getGeometry().getFirstCoordinate(), accuracy),
        stroke: accuracyStrokeStyle
      });
    }
    const { "filterLocationInterval": filterLocationInterval,
      "showLocationAccuracy":showLocationAccuracy } = this.getProperties("filterLocationInterval", 'showLocationAccuracy');
    return function(feature){
      const data = feature.get("data");
      const accuracy = data.accuracy || 15.0;
      if(filterLocationInterval != null){
        const {from, to} = filterLocationInterval.getProperties("from", "to");
        const time = data.time;
        if(time.isBetween(from,to) || time.isSame(from) || time.isSame(to)){
          if(showLocationAccuracy && accuracy){
            return [selectedStyle, accuracyStyle(feature,accuracy)];
          }else{
            return [selectedStyle];
          }
        }else {
          return [deselectedStyle];
        }
      }else{
        if(showLocationAccuracy && accuracy){
          return [normalStyle, accuracyStyle(feature,accuracy)];
        }else{
          return [normalStyle];
        }
      }
    };
  }).property('filterLocationInterval', 'showLocationAccuracy')
});