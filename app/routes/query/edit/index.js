import Ember from "ember";

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      this.controllerFor('query.edit').set('inEdit', true);
      return true;
    },
    willTransition: function(){
      this.controllerFor('query.edit').set('inEdit', false);
      return true;
    }
  }
});