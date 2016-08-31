import Ember from 'ember';
import ol from 'ol';

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
      if(resolution < 10.0){
        const coordinates = geometry.getCoordinates();
        if(coordinates.length >= 2){
          const index = Math.floor(coordinates.length/2);
          const start = coordinates[index - 1];
          const end = coordinates[index];
          var dx = end[0] - start[0];
          var dy = end[1] - start[1];
          var rotation = Math.atan2(dy, dx);
          styles.push(new ol.style.Style({
            geometry: new ol.geom.Point([start[0] + dx/2.0,start[1] + dy/2.0]),
            image: new ol.style.Icon({
              src: `assets/images/${arrowIcon}`,
              anchor: [0.5, 0.5],
              rotateWithView: false,
              rotation: - rotation,
              scale: 1.5
            })
          }));
        }
      }
      return styles;
    };
  }).property('selectedStayMove', 'showEvents')
});