import Ember from "ember";

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  sparql: Ember.inject.service(),
  query: 'CONSTRUCT{ ?s ?p ?o } WHERE { ?s ?p ?o } LIMIT 100',
  savedQueries: function () {
    return this.store.findAll('sparql-query');
  }.property(),
  actions: {
    query() {
      let query = this.get('query');
      let sparql = this.get('sparql');
      sparql.query(query).then((result) => this.set('result', result));
    },
    save() {
      const id = prompt("Query name?");
      // check if not null/undefined and non-empty.
      if (id != null && id.length > 0) {
        const query = this.get('query');
        this.store.find('sparql-query', id)
          .catch(() => {
            // In case a query with the same name does not exist,
            // we must unload the record created by the find method
            // Ember Data does not currently provide a simple findOrCreate ...
            const queryModel = this.store.recordForId('sparql-query', id);
            queryModel.unloadRecord();
            return this.store.createRecord('sparql-query', {id: id});
          }).then((queryModel) => {
          queryModel.set('content', query);
          queryModel.save();
        });
      }
    },
    selectQuery(query) {
      this.set('query', query);
    }
  }
});
