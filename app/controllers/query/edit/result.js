import Ember from "ember";
/* global download */

export default Ember.Controller.extend({
  queryController: Ember.inject.controller('query.edit'),
  queryResult: Ember.computed.readOnly('queryController.query.result'),
  queryType: Ember.computed.readOnly('queryResult.queryType'),
  error: Ember.computed.readOnly('queryResult.reason'),
  errorLines: Ember.computed('error', function(){
    if(this.get('error') != null){
      return this.get('error').split('\n');
    }else{
      return [];
    }
  }),
  queryResultContent: Ember.computed.readOnly('queryResult.result'),
  resultCount: function () {
    const queryResultContent = this.get('queryResultContent');
    if (this.get('queryType') === 'SELECT') {
      return `${queryResultContent.results.bindings.length} rows`;
    } else if (this.get('queryType') === 'CONSTRUCT') {
      var count = 0;
      for (const subject of Object.keys(queryResultContent)) {
        for (const property of Object.keys(queryResultContent[subject])) {
          count += queryResultContent[subject][property].length;
        }
      }
      return `${count} triples`;
    } else {
      return null;
    }
  }.property('queryResultContent'),
  hasCsv: function () {
    if (this.get('queryType') === 'SELECT') {
      return true;
    } else if (this.get('queryType') === 'CONSTRUCT') {
      // TODO: csvUri for CONSTRUCT query.
      return false;
    } else {
      return false;
    }
  }.property('queryType'),
  actions:{
    downloadAsCsv(){
      if (this.get('queryType') === 'SELECT') {
        const queryResultContent = this.get('queryResultContent');
        const header = queryResultContent.head.vars;
        const data = header.join(",") + "\n" +
          queryResultContent.results.bindings.map(row => header.map(function (varName) {
            const cell = row[varName];
            if (cell == null || cell === '') {
              return '';
            } else {
              const escapedQuotesCellValue = cell.value.replace(/"/g, '""');
              return `"${escapedQuotesCellValue}"`;
            }
          }).join(",")).join("\n");
        download(data, "sparql-result.csv", "text/csv");
      } else if (this.get('queryType') === 'CONSTRUCT') {
        // TODO: csvDownload for CONSTRUCT query ?
      }
    }
  }
});
