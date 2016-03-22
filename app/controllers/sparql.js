import Ember from "ember";

class QueryStorage {

  /**
   * @param {Storage} storage
   */
  constructor(storage) {
    this.storage = storage;
  }

  getQuery(name) {
    return this.storage.getItem(name);
  }

  setQuery(name, query) {
    return this.storage.setItem(name, query);
  }

  getQueryList() {
    let list = [];
    for (let i = 0; i < this.storage.length; i++) {
      list.push(this.storage.key(i));
    }
    return list;
  }
}

export default Ember.Controller.extend({

  queryStorage: new QueryStorage(window.localStorage),
  query: 'SELECT ?o WHERE { ?s ?p ?o } LIMIT 100',
  savedQueries: Ember.computed('queryStorage', function () {
    return this.queryStorage.getQueryList();
  }),
  actions: {
    query() {
      function cleanResult(result) {
        if (result.head.vars) {
          return {
            head: {
              vars: result.head.vars
            },
            results: {
              bindings: result.results.bindings.map(binding =>
                result.head.vars.map(varName => binding[varName] || null)
              )
            }
          };
        } else {
          return result;
        }
      }

      Ember.$.ajax({
        data: {
          query: this.get('query')
        },
        dataType: 'json',
        url: 'http://127.0.0.1:8080/sparql' //TODO
      }).done(result => {
        this.set('result', cleanResult(result));
      }).fail(function () {
        alert('query failed');
      });
    },
    save() {
      this.queryStorage.setQuery(prompt("query name"), this.get("query"));
      this.set('savedQueries', this.queryStorage.getQueryList());
    },
    selectOldQuery(name) {
      this.set('query', this.queryStorage.getQuery(name));
    }
  }
});
