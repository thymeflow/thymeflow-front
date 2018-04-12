import Ember from 'ember';
import ol from 'ol';
import ENV from 'thymeflow-front/config/environment';

const wgs84Sphere = new ol.Sphere(6378137);

export default Ember.Object.extend({
  strokeInnerStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#37abc8',
      width: 4
    })
  }),
  strokeOuterStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#164450',
      width: 6
    })
  }),
  selectedStrokeInnerStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#164450',
      width: 4
    })
  }),
  selectedStrokeOuterStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#164450',
      width: 6
    })
  }),
  eventStrokeInnerStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#c84137',
      width: 4
    })
  }),
  eventStrokeOuterStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#501a16',
      width: 6
    })
  }),
  selectedEventStrokeInnerStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#501a16',
      width: 4
    })
  }),
  selectedEventStrokeOuterStyle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#501a16',
      width: 6
    })
  }),
  style: (function() {
    const normalStyles = [this.get("strokeOuterStyle"), this.get("strokeInnerStyle")];
    const selectedStyles = [this.get("selectedStrokeOuterStyle"), this.get("selectedStrokeInnerStyle")];
    const eventNormalStyles = [this.get("eventStrokeOuterStyle"), this.get("eventStrokeInnerStyle")];
    const selectedEventStyles = [this.get("selectedEventStrokeOuterStyle"), this.get("selectedEventStrokeInnerStyle")];
    const selectedStayMove = this.get('selectedStayMove');
    const showEvents = this.get('showEvents');
    return function(feature, resolution){
      const geometry = feature.getGeometry();
      const data = feature.get("data");
      const hasEvents = showEvents && data.get('events.length') > 0;
      const isSelected = data === selectedStayMove;
      // clone the styles
      const styles = isSelected ? (hasEvents ? selectedEventStyles.slice() : selectedStyles.slice()): (hasEvents ? eventNormalStyles.slice() : normalStyles.slice());
      const arrowIcon = isSelected ? (hasEvents ? "selected-event-arrow.svg" : "selected-arrow.svg") : (hasEvents ? "event-arrow.svg" : "arrow.svg");
      let d = resolution * 75;
      const coordinates = geometry.getCoordinates();
      if(coordinates.length >= 2){
        let totalMove = 0;
        for (let i = 1; i < coordinates.length; i++) {
          const index = i;
          const start = coordinates[index - 1];
          const end = coordinates[index];
          totalMove +=  wgs84Sphere.haversineDistance(ol.proj.transform(start, "EPSG:3857", "EPSG:4326"), ol.proj.transform(end, "EPSG:3857", "EPSG:4326"));
        }
        if(totalMove > 1){
          if(totalMove * 0.8 < d && (totalMove * 0.7/resolution) > 25){
            d = totalMove * 0.7;
          }
          let cumulatedMove = 0;
          for (let i = 1; i < coordinates.length; i++) {
            const index = i;
            const start = coordinates[index - 1];
            const end = coordinates[index];
            const currentD = wgs84Sphere.haversineDistance(ol.proj.transform(start, "EPSG:3857", "EPSG:4326"), ol.proj.transform(end, "EPSG:3857", "EPSG:4326"));
            cumulatedMove += currentD;
            let r = 0.5;
            while (cumulatedMove >= d ) {
              cumulatedMove -= d;
              if (currentD > 0) {
                r = (currentD - cumulatedMove) / currentD;
              }
              const dx = end[0] - start[0];
              const dy = end[1] - start[1];
              const rotation = Math.atan2(dy, dx);
              styles.push(new ol.style.Style({
                geometry: new ol.geom.Point([start[0] + dx * r, start[1] + dy * r]),
                image: new ol.style.Icon({
                  src: `${ENV.rootURL}assets/images/${arrowIcon}`,
                  anchor: [0.5, 0.5],
                  rotateWithView: false,
                  rotation: -rotation,
                  scale: 1.8
                })
              }));
            }
          }
        }
      }
      return styles;
    };
  }).property('selectedStayMove', 'showEvents')
});