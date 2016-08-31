import Ember from 'ember';
import ol from 'ol';


export default Ember.Controller.extend({
  queryParams: ["date", "minimumStayDurationMinutes","showLocations","details","showEvents", "showLocationAccuracy"],
  date: null,
  details: false,
  showLocations: true,
  showLocationAccuracy: false,
  showEvents: false,
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
      let lastTo = null;
      const startOfDay = date.clone().startOf('day');
      const endOfDay = date.clone().endOf('day');
      let moveCoordinates = [];
      let moveDistance = 0;
      const addMoveCoordinates = (newCoordinates) => {
        if(moveCoordinates.length > 0){
          moveDistance += ol.sphere.WGS84.haversineDistance(moveCoordinates[moveCoordinates.length - 1], newCoordinates);
        }
        moveCoordinates.push(newCoordinates);
      };
      let stayIndex = 1;
      stays.forEach((stay, index) => {
        const {from: from, to: to, longitude: longitude, latitude: latitude} = stay;
        const currentCoordinates = [longitude, latitude];
        if(to.diff(from,'minutes') >= minimumStayDuration){
          if(index === 0 && from.isAfter(startOfDay)){
            filteredStayMoves.push(new Ember.Object({
              type: 'move',
              from: startOfDay,
              to: from
            }));
          }
          if(lastTo != null){
            addMoveCoordinates(currentCoordinates);
            const moveDuration = from.diff(lastTo,'seconds');
            const move = new Ember.Object({
              type: 'move',
              from: lastTo,
              to: from,
              distance: moveDistance,
              speed: moveDistance / moveDuration,
              geometry: new ol.geom.LineString(moveCoordinates)
            });
            filteredStayMoves.push(move);
            filteredMoves.push(move);
          }
          lastTo = to;
          moveCoordinates = [currentCoordinates];
          const stayO = new Ember.Object({
            index: stayIndex,
            type: 'stay',
            from: from,
            to: to,
            geometry: stay.point,
            events: stay.events
          });
          stayIndex += 1;
          filteredStayMoves.push(stayO);
          filteredStays.push(stayO);
        }else{
          addMoveCoordinates(currentCoordinates);
        }
      });
      if(lastTo != null && lastTo.isBefore(endOfDay)) {
        filteredStayMoves.push(new Ember.Object({
          type: 'move',
          from: lastTo,
          to: endOfDay
        }));
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