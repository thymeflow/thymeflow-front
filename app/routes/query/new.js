import Ember from "ember";

export default Ember.Route.extend({
  afterModel: function(){
    this.replaceWith('query.edit', 'new');
  }
});