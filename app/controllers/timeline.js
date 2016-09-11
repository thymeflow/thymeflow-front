import Ember from 'ember';
import ol from 'ol';
import moment from 'moment';

const wgs84Sphere = new ol.Sphere(6378137);

export default Ember.Controller.extend({
  queryParams: ["date", "minimumStayDurationMinutes","showLocations","details","showEvents", "showLocationAccuracy", "timeZone"],
  date: null,
  timeZone: moment.tz.guess(),
  details: false,
  showLocations: true,
  showLocationAccuracy: false,
  showEvents: true,
  locations: function(){
    if(this.get('showLocations')){
      return this.get('model.locations');
    }else{
      return Ember.A();
    }
  }.property('model.locations', 'showLocations'),
  events: null,
  minimumStayDurationMinutes: 15,
  filteredStays: null,
  filteredMoves: null,
  filteredStayMoves: null,
  selectedStayMove: null,
  noLocations: function() {
    const locations = this.get('model.locations');
    const noStays = this.get('noStays');
    if(locations != null){
      return locations.get('length') === 0 && noStays;
    }else{
      return noStays;
    }
  }.property('model.locations.[]', 'noStays'),
  noStays: function() {
    const stays = this.get('model.stays');
    if(stays != null){
      return stays.get('length') === 0;
    }else{
      return true;
    }
  }.property('model.stays.[]'),
  updateFilteredStayMoves: function(){
    const stays = this.get('model.stays');
    const minimumStayDuration = this.get('minimumStayDurationMinutes');
    const date = this.get('model.date');
    if(stays != null && date != null){
      this.send("toggleSelectedStayMove", null);
      const filteredStayMoves = [];
      const filteredStays = [];
      const filteredMoves = [];
      let firstMoveStepFrom = null;
      let previousMoveStepTo = null;
      let moveCoordinates = [];
      let moveDistance = 0;
      const addMoveCoordinates = (newCoordinates) => {
        if(moveCoordinates.length > 0){
          moveDistance += wgs84Sphere.haversineDistance(moveCoordinates[moveCoordinates.length - 1], newCoordinates);
        }
        moveCoordinates.push(newCoordinates);
      };
      let stayIndex = 1;
      stays.forEach((stay/*, index*/) => {
        const {from: from, to: to, longitude: longitude, latitude: latitude} = stay;
        const currentCoordinates = [longitude, latitude];
        if(to.diff(from,'minutes') >= minimumStayDuration){
          if(firstMoveStepFrom != null){
            addMoveCoordinates(currentCoordinates);
            const moveDuration = from.diff(firstMoveStepFrom,'seconds');
            const move = new Ember.Object({
              type: 'move',
              from: firstMoveStepFrom,
              to: from,
              distance: moveDistance,
              speed: moveDistance / moveDuration,
              geometry: new ol.geom.LineString(moveCoordinates)
            });
            filteredStayMoves.push(move);
            filteredMoves.push(move);
          }
          firstMoveStepFrom = to;
          previousMoveStepTo = null;
          moveCoordinates = [currentCoordinates];
          const stayO = new Ember.Object({
            index: stayIndex,
            type: 'stay',
            from: from,
            to: to,
            geometry: stay.point,
            events: stay.events
          });
          moveDistance = 0;
          stayIndex += 1;
          filteredStayMoves.push(stayO);
          filteredStays.push(stayO);
        }else{
          if(firstMoveStepFrom == null){
            firstMoveStepFrom = from;
          }
          previousMoveStepTo = to;
          addMoveCoordinates(currentCoordinates);
        }
      });
      if(previousMoveStepTo != null && moveCoordinates.length >= 2) {
        const moveDuration = previousMoveStepTo.diff(firstMoveStepFrom,'seconds');
        const move = new Ember.Object({
          type: 'move',
          from: firstMoveStepFrom,
          to: previousMoveStepTo,
          distance: moveDistance,
          speed: moveDistance / moveDuration,
          geometry: new ol.geom.LineString(moveCoordinates)
        });
        filteredStayMoves.push(move);
        filteredMoves.push(move);
      }
      this.set('filteredStayMoves', filteredStayMoves);
      this.set('filteredStays', filteredStays);
      this.set('filteredMoves', filteredMoves);
    }else{
      this.set('filteredStayMoves', null);
      this.set('filteredStays', null);
      this.set('filteredMoves', null);
    }
  }.observes('model.stays'),
  filteredStaysDurationAsMinutes: function(){
    const filteredStays = this.get('filteredStays');
    if(filteredStays != null){
      const durationSeconds = filteredStays.reduce(function(cumulative, stay){
        return cumulative + stay.get('to').diff(stay.get('from'),'seconds');
      }, 0);
      const durationAsMinutes = moment.duration(durationSeconds, 'seconds').asMinutes();
      return Math.floor(durationAsMinutes * 100)/100;
    }else{
      return null;
    }
  }.property('filteredStays'),
  observeMinimumStayDurationMinutes: Ember.observer('minimumStayDurationMinutes', function(){
    Ember.run.debounce(this, this.updateFilteredStayMoves, 500);
  }),
  actions: {
    toggleSelectedStayMove(stayMove){
      const selectedStayMove = this.get('selectedStayMove');
      if(stayMove === selectedStayMove){
        this.set('selectedStayMove', null);
        this.set('filterLocationInterval', null);
      }else{
        this.set('selectedStayMove', stayMove);
        this.set('filterLocationInterval', stayMove);
      }
    },
    onDetails(show) {
      this.set('details', show);
    },
    changeDate(date){
      this.send("toggleSelectedStayMove", null);
      this.set("date", date.format("YYYY-MM-DD"));
    }
  }
});