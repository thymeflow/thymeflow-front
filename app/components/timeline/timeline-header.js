import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  classNames: ['timeline-header'],
  searchValue: null,
  classNameBindings: ['details:details'],
  timeZones: moment.tz.names(),
  dateJs: function(){
    const date = this.get('date');
    if(date != null){
      // parse the raw date in the browser's timezone
      return moment(date, "YYYY-MM-DD").toDate();
    }else{
      return date;
    }
  }.property('date'),
  actions: {
    selectTimeZone(value){
      this.set('timeZone', value);
    },
    showDetails() {
      this.get('onDetails')(true);
    },
    hideDetails() {
      this.get('onDetails')(false);
    },
    showDate(date){
      if(date != null){
        // provide the date in the browser's timezone
        this.get('onDate')(moment(date));
      }
    },
    showToday() {
      // Today in the current time zone !
      const timeZone = this.get('timeZone');
      this.get('onDate')(moment().tz(timeZone));
    }
  }
});