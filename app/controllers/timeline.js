import Ember from 'ember';
import ol from 'ol';


export default Ember.Controller.extend({
  queryParams: ["date", "minimumStayDurationMinutes", "details", "showLocationAccuracy"],
  date: null,
  details: false,
  showLocationAccuracy: false,
  minimumStayDurationMinutes: 15,
  filteredStays: null,
  filteredMoves: null,
  filteredStayMoves: null,
  selectedStayMove: null,
  noLocations: function() {
    const items = this.get('model.locations');
    if(items != null){
      return items.get('length') === 0;
    }else{
      return true;
    }
  }.property('model.locations.[]'),
  noStays: function() {
    const items = this.get('model.stays');
    if(items != null){
      return items.get('length') === 0;
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
            geometry: stay.point
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