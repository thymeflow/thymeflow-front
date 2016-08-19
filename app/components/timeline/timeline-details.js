import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['timeline-details'],
  classNameBindings: ['details:details'],
  isEmpty: function() {
    const items = this.get('items');
    if(items != null){
      return items.get('length') === 0;
    }else{
      return false;
    }
  }.property('items.[]'),
  actions: {
    nextDate(){
      const date = this.get('date');
      if(date != null){
        this.get('onDate')(date.add(1, 'd'));
      }
    },
    previousDate(){
      const date = this.get('date');
      if(date != null){
        this.get('onDate')(date.add(-1, 'd'));
      }
    },
    toggleSelected(item){
      this.get('toggleSelected')(item);
    }
  }
});