import Ember from "ember";

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  sparql: Ember.inject.service(),
  query: Ember.computed.alias('model'),
  _queryContent:
`PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>

SELECT ?s ?p ?o
WHERE {
 ?s ?p ?o 
} LIMIT 100`,
  queryContent: Ember.computed('query.content', '_queryContent', {
    get() {
      const queryContent = this.get('query.content');
      if (queryContent != null) {
        this.set('_queryContent', queryContent);
        return queryContent;
      } else {
        return this.get('_queryContent');
      }
    },
    set(_, value) {
      const query = this.get('query');
      if (query != null) {
        query.set('content', value);
      }
      this.set('_queryContent', value);
      return value;
    }
  }),
  savedQueries: function () {
    return this.store.findAll('sparql-query');
  }.property(),
  actions: {
    query() {
      const queryContent = this.get('queryContent');
      const sparql = this.get('sparql');
      const result = sparql.query(queryContent);
      this.set('result', result);
    },
    save(queryName) {
      const query = this.get('query');
      if (query != null) {
        // save query content
        query.set('content', this.get('queryContent'));
        query.save();
      } else {
        if (queryName == null) {
          queryName = prompt("Query name?");
        }
        if (queryName != null && queryName.length > 0) {
          const id = queryName;
          const queryContent = this.get('queryContent');
          this.store.findRecord('sparql-query', id)
            .catch(() => {
              // In case a query with the same name does not exist,
              // we must unload the record created by the find method
              // This is due to a problem with Ember-Data https://github.com/emberjs/data/issues/4424
              // and ember-local-storage's behaviour
              const queryModel = this.store.recordForId('sparql-query', id);
              queryModel.unloadRecord();
              return this.store.createRecord('sparql-query', {id: id});
            }).then((queryModel) => {
            queryModel.set('content', queryContent);
            return queryModel.save();
          }).then(queryModel => this.transitionToRoute('sparql.item', queryModel));
        }
      }
    },
    createOnEnter(select, e) {
      if (e.keyCode === 13 && select.isOpen && !select.highlighted && !Ember.isBlank(select.searchText)) {
        this.set('query', null);
        this.send('save', select.searchText);
      }
    },
    delete(){
      const query = this.get('query');
      query.destroyRecord();
      this.transitionToRoute('sparql.index');
    },
    selectQuery(query) {
      this.transitionToRoute('sparql.item', query);
    }
  }
});
