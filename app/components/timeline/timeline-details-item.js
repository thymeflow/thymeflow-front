import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  tagName: '',
  item: null,
  highlighted: function(){
    return this.get('item') === this.get('selectedItem');
  }.property('selectedItem'),
  isStay: function(){
    return this.get('item.type') === "stay";
  }.property('item.type'),
  duration: function(){
    return moment.duration(this.get('item.to').diff(this.get('item.from'),'seconds'),"seconds").humanize();
  }.property('item.from', 'item.to'),
  actions: {
    toggleSelected(){
      this.get('toggleSelected')(this.get('item'));
    }
  }

});