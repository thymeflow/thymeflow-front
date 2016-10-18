import Ember from "ember";

export default Ember.Controller.extend({
  fieldsSorting: ['propertyName'],
  sortedFields: Ember.computed.sort('model.fields', 'fieldsSorting'),
});
