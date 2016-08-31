import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  tagName: 'tr',
  classNames: ['timeline-row'],
  classNameBindings: ['selected:table-info'],
  elementInserted: false,
  observedSelected: (function (){
    const selected = this.get('selected');
    if(selected){
      const element = this.get('element');
      if(element != null){
        this.get('scrollTo')(element);
      }
    }
  }).observes('selected').on('didInsertElement')
});