import Ember from 'ember';

export default Ember.Route.extend({
  model() {

    return this.get('store').findAll('data-service').catch(function(error) {
      console.log(error);
    });
  },
  actions: {
    refresh() {
      this.refresh();
    }
  }
});
