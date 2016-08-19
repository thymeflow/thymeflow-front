import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  classNames: ['timeline-header'],
  searchValue: null,
  classNameBindings: ['details:details'],
  dateJs: function(){
    const date = this.get('date');
    if(date != null){
      return date.toDate();
    }else{
      return date;
    }
  }.property('date'),
  actions: {
    showDetails() {
      this.get('onDetails')(true);
    },
    hideDetails() {
      this.get('onDetails')(false);
    },
    showDate(date){
      if(date != null){
        this.get('onDate')(moment(date));
      }
    },
    showToday() {
      this.get('onDate')(moment());
    }
  }
});