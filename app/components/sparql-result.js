import Ember from "ember";
/* global download */

export default Ember.Component.extend({
  tagName: "",
  isSelect: function () {
    return this.get('queryType') === "SELECT";
  }.property('queryType'),
  isAsk: function () {
    return this.get('queryType') === "ASK";
  }.property('queryType'),
  isConstruct: function () {
    return this.get('queryType') === "CONSTRUCT";
  }.property('queryType'),
  isUpdate: function () {
    return this.get('queryType') === "UPDATE";
  }.property('queryType'),
  resultCount: function () {
    const result = this.get('result');
    if (this.get('isSelect')) {
      return `${result.results.bindings.length} rows`;
    } else if (this.get('isConstruct')) {
      var count = 0;
      for (const subject of Object.keys(result)) {
        for (const property of Object.keys(result[subject])) {
          count += result[subject][property].length;
        }
      }
      return `${count} triples`;
    } else {
      return null;
    }
  }.property('result'),
  hasCsv: function () {
    if (this.get('isSelect')) {
      return true;
    } else if (this.get('isConstruct')) {
      // TODO: csvUri for CONSTRUCT query.
      return false;
    } else {
      return false;
    }
  }.property('isSelect', 'isConstruct'),
  actions:{
    downloadAsCsv(){
      if (this.get('isSelect')) {
        const result = this.get('result');
        const header = result.head.vars;
        const data = header.join(",") + "\n" +
          result.results.bindings.map(row => header.map(function (varName) {
            const cell = row[varName];
            if (cell == null || cell === '') {
              return '';
            } else {
              const escapedQuotesCellValue = cell.value.replace(/"/g, '""');
              return `"${escapedQuotesCellValue}"`;
            }
          }).join(",")).join("\n");
        download(data, "sparql-result.csv", "text/csv");
      } else if (this.get('isConstruct')) {
        // TODO: csvDownload for CONSTRUCT query ?
      }
    }
  }
});
