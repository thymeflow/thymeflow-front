import Ember from "ember";

export default Ember.Controller.extend({
  actions: {
    openQuery(query){
      console.log(query);
      this.transitionToRoute('query.edit', query);
    }
  }
});
