import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  icon: Ember.computed('name', function() {
    switch (`${this.get('name')}`) {
      case 'Google': return 'fa-google';
      case 'Microsoft': return 'fa-windows';
      case 'Facebook': return 'fa-facebook';
      case 'File': return 'fa-file';
      case 'Email': return 'fa-envelope';
      default: return 'fa-tasks';
    }
  }),
  accounts: DS.attr(),
  accountsCount: Ember.computed('accounts', function() {
    return this.get('accounts').length;
  })
});
