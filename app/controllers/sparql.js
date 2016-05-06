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
      function jsonUnescape(str) {
        if (typeof str === 'string') {
          return str
            .replace('\\"', '"')
            .replace('\\b', '\b')
            .replace('\\f', '\f')
            .replace('\\n', '\n')
            .replace('\\r', '\r')
            .replace('\\t', '\t');
        } else {
          return str;
        }
      }

      function cleanResult(result) {
        if (result.head.vars) {
          return {
            head: {
              vars: result.head.vars
            },
            results: {
              bindings: result.results.bindings.map(binding =>
                result.head.vars.map(varName => jsonUnescape(binding[varName]) || null)
              )
            }
          };
        } else {
          return result;
        }
      }

      function resultToCSVUri( result ) {
        if ( !result.head.vars ) {
          return null;
        }
        return 'data:text/csv;charset=utf-8,' + encodeURIComponent(
            result.head.vars.join( "," ) + "\n" +
            result.results.bindings.map( line => line.map( function ( cell ) {
              if ( cell === null ) {
                return '';
              } else {
                return '"' + cell.value.replace( '"', '' ) + '"';
              }
            } ).join( "," ) ).join( "\n" )
          );
      }

      Ember.$.ajax({
        data: {
          query: this.get('query')
        },
        dataType: 'json',
        url: 'http://127.0.0.1:8080/sparql' //TODO
      }).done(result => {
        let finalResult = cleanResult( result );
        this.set( 'result', finalResult );
        this.set( 'csvUri', resultToCSVUri( finalResult ) );
        this.set( 'error', null );
      }).fail(jqXHR => {
        this.set( 'result', null );
        this.set( 'csvUri', null );
        this.set('error', jqXHR.responseText);
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
