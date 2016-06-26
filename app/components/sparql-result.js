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
  // header represents the binding variables of a SELECT query
  header: function () {
    const result = this.get('result');
    if (this.get('isSelect')) {
      return result.head.vars;
    } else {
      return null;
    }
  }.property('result'),
  // rows represent the results of a SELECT query
  rows: function () {
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

    const result = this.get('result');
    const vars = result.head.vars;
    if (this.get('isSelect')) {
      return result.results.bindings.map(binding =>
        vars.map(varName => jsonUnescape(binding[varName]) || null)
      );
    } else {
      return null;
    }
  }.property('result'),
  // csvUri builds a Uri of the results of a SELECT query
  csvUri: function () {
    if (!this.get('isSelect')) {
      return null;
    } else {
      return 'data:text/csv;charset=utf-8,' + encodeURIComponent(
          this.get('header').join(",") + "\n" +
          this.get('rows').map(line => line.map(function (cell) {
            if (cell === null) {
              return '';
            } else {
              return '"' + cell.value.replace('"', '') + '"';
            }
          }).join(",")).join("\n")
        );
    }
  }.property('header', 'rows')
});
