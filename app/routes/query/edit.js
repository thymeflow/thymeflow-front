import Ember from "ember";

export default Ember.Route.extend({
  model: function (param) {
    const id = param.query_name;
    if(id != null){
      return this.store.findRecord('sparql-query', id).catch(() =>{
        // In case a query with the provided name does not exist,
        // we must unload the record created by the find method
        // This is due to a problem with Ember-Data https://github.com/emberjs/data/issues/4424
        // and ember-local-storage's behaviour
        const queryModel = this.store.recordForId('sparql-query', id);
        queryModel.unloadRecord();
        if(id === "new") {
          return this.store.createRecord('sparql-query', {
            id: id,
            draft: 'CONSTRUCT{ ?s ?p ?o } WHERE { ?s ?p ?o } LIMIT 100'
          });
        }else{
          return null;
        }
      });
    }else{
      return null;
    }
  },
  afterModel: function(model){
    if(model == null){
      this.replaceWith('query.new');
    }
  },
  serialize: function (model) {
    if(model != null){
      return {query_name: model.id};
    }else{
      return {};
    }
  },
  actions: {
    error(error) {
      if (error) {
        this.replaceWith('query.new');
      }
    }
  }
});