import Ember from "ember";

export default Ember.Component.extend({
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
  csvUri: function () {
    const result = this.get('result');
    if (this.get('isSelect')) {
      // uri of the results of a SELECT query
      const header = result.head.vars;
      return 'data:text/csv;charset=utf-8,' + encodeURIComponent(
          header.join(",") + "\n" +
          result.results.bindings.map(row => header.map(function (varName) {
            const cell = row[varName];
            if (cell === null) {
              return '';
            } else {
              return '"' + cell.value.replace('"', '""') + '"';
            }
          }).join(",")).join("\n")
        );
    } else if (this.get('isConstruct')) {
      // TODO: csvUri for CONSTRUCT query.
      return null;
    } else {
      return null;
    }
  }.property('result')
});
