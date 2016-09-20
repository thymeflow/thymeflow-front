import Ember from 'ember';
import ENV from 'thymeflow-front/config/environment';

export default Ember.Route.extend({
  afterModel() {

    let self = this;

    Ember.run.later(function() {

      self.refresh();
    }, ENV.APP.systemTasksPollingInterval);
  },
  model() {

    return this.get('store').findAll('system-task');
  }
});