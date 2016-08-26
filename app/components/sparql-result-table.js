import Ember from "ember";

const pixelsPerCharacter = 8.8;

const ColumnDefinition = Ember.Object.extend({
  width: function () {
    return this.get('length') * pixelsPerCharacter + 16;
  }.property('length'),
  length: 0,
  style: function () {
    return Ember.String.htmlSafe(`width: ${this.get('width')}px`);
  }.property('width'),
  extendLength: function (newLength) {
    this.set('length', Math.max(this.get('length'), newLength));
  }
});

export default Ember.Component.extend({
  scrollLeft: 0,
  columnsPercent: [100],
  headerStyle: function () {
    return Ember.String.htmlSafe(`width: ${this.get('tableWidth')}px`);
  }.property('tableWidth'),
  tableWidth: function () {
    var width = 0;
    this.get('columns').forEach(column => width += column.get('width'));
    return width;
  }.property('columns'),
  columns: [],
  rows: [],
  estimatedLength: function (value) {
    if (value != null) {
      switch (value.type) {
        case "literal":
          return value.value.length + 2 + ((value["xml:lang"] != null) ? (value["xml:lang"].length + 1) : 0) + 2 + ((value.datatype != null) ? value.datatype.length : 0);
        case "bnode":
          return value.value.length + 2;
        default:
          return value.value.length;
      }
    } else {
      return 0;
    }
  },
  observesResult: function () {
    const removePrefix = this.get('removePrefix');
    const result = this.get('result');
    const vars = result.head.vars;
    const columns = vars.map(varName => ColumnDefinition.create({name: varName}));
    const columnByName = new Map();
    columns.forEach(column => columnByName.set(column.get('name'), column));
    this.set('rows', result.results.bindings.map(binding => {
      return columns.map(column => {
        // copy the column value
        let valueForColumn = binding[column.name];
        if (valueForColumn != null) {
          valueForColumn = Object.assign({}, valueForColumn);
          column.extendLength(this.estimatedLength(valueForColumn));
          valueForColumn.value = removePrefix(valueForColumn.value);
          valueForColumn.column = column;
        }
        return valueForColumn;
      });
    }));
    this.set('columns', columns);
  }.observes('result').on('init')
});