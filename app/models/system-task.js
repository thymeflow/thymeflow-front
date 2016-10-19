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
  serviceIcon: Ember.computed('service', function() {

    switch (`${this.get('service')}`) {
        case 'Google': return 'fa-google';
        case 'Microsoft': return 'fa-windows';
        case 'Facebook': return 'fa-facebook';
        case 'File': return 'fa-file';
        case 'Email': return 'fa-envelope';
        default: return 'fa-tasks';
    }
  })
});
