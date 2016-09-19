import Ember from 'ember';

const pollingInterval = 30000;

export default Ember.Route.extend({
  afterModel() {

    let self = this;

    Ember.run.later(function() {

      self.refresh();
    }, pollingInterval);
  },
  model() {

    return this.get('store').findAll('system-task');
  }
});