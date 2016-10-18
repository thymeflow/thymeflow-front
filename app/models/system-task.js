import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  service: DS.attr('string'),
  account: DS.attr('string'),
  source: DS.attr('string'),
  name: DS.attr('string'),
  startDate: DS.attr('string'),
  endDate: DS.attr('string'),
  type: DS.attr('string'),
  progress: DS.attr('number'),
  status: DS.attr('string'),
  icon: Ember.computed('type', function() {

    switch (`${this.get('type')}`) {

        default: return 'fa-tasks';
    }
  })
});
