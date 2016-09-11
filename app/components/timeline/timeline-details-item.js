import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  tagName: '',
  item: null,
  showEventsNotEmpty: function(){
    return this.get('showEvents') && this.get('item.events.length') > 0;
  }.property('showEvents', 'item.events.length'),
  highlighted: function(){
    return this.get('item') === this.get('selectedItem');
  }.property('selectedItem'),
  isStay: function(){
    return this.get('item.type') === "stay";
  }.property('item.type'),
  duration: function(){
    return moment.duration(this.get('item.to').diff(this.get('item.from'),'seconds'),"seconds");
  }.property('item.from', 'item.to'),
  durationFormatted: function(){
    return this.get('duration').humanize();
  }.property('duration'),
  durationAsMinutes: function(){
    return this.get('duration').asMinutes();
  }.property('duration'),
  speedFormatted: function(){
    const speed = this.get('item.speed');
    return `${Math.round(speed * 10) / 10} m/s`;
  }.property(),
  distanceFormatted: function(){
    const distance = this.get('item.distance');
    if(distance >= 1000){
      const distanceKilometers = Math.round(distance / 100) / 10;
      return `${distanceKilometers} km`;
    }else{
      const distanceMeters = Math.round(distance);
      return `${distanceMeters} m`;
    }
  }.property(),
  actions: {
    toggleSelected(){
      this.get('toggleSelected')(this.get('item'));
    }
  }

});