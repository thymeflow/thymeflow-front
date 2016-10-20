import Ember from 'ember';
import ENV from 'thymeflow-front/config/environment';

export default Ember.Route.extend({
  afterModel() {
    this.poll();
  },
  model() {
    return this.get('store').findAll('system-task').catch(function(error) {
      console.log(error);
    });
  },
  poll() {
    let self = this;
    Ember.run.later(function() {
      self.modelFor(self.routeName).update();
      self.poll();
    }, ENV.APP.systemTasksPollingInterval);
  }
});
