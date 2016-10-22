import Ember from "ember";

export default Ember.Route.extend({
  model: function(){
    const query = this.modelFor('query.edit');
    return query.execute(false);
  }
});