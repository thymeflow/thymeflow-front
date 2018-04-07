import Ember from "ember";

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  query: Ember.computed.alias('model'),
  tableCompatible: Ember.computed('query.result.queryType', function(){
    switch(this.get('query.result.queryType')){
      case "SELECT": return true;
      case "ASK": return true;
      default: return false;
    }
  }),
  mapCompatible: Ember.computed('query.result.queryType', function(){
    switch(this.get('query.result.queryType')){
      case "SELECT": return true;
      case "CONSTRUCT": return true;
      default: return false;
    }
  }),
  graphCompatible: Ember.computed('query.result.queryType', function(){
    switch(this.get('query.result.queryType')){
      case "CONSTRUCT": return true;
      default: return false;
    }
  }),
  actions: {
    query() {
      const query = this.get('query');
      query.execute(true);
    }
  }
});
