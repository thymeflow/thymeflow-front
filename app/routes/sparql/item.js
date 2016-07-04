import Ember from "ember";

export default Ember.Route.extend({
  model: function (param) {
    if (param.query_name) {
      const id = param.query_name;
      return this.store.findRecord('sparql-query', id).catch((error) => {
        // In case a query with the provided name exists,
        // we must unload the record created by the find method
        // This is due to a problem with Ember-Data https://github.com/emberjs/data/issues/4424
        // and ember-local-storage's behaviour
        const queryModel = this.store.recordForId('sparql-query', id);
        queryModel.unloadRecord();
        throw error;
      });
    }
  },
  serialize: function (model) {
    if (model != null) {
      return {query_name: model.id};
    } else {
      return {query_name: ''};
    }
  },
  actions: {
    error(error) {
      if (error) {
        return this.transitionTo('sparql.index');
      }
    }
  }
});