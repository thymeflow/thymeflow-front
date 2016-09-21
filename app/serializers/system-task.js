import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  attrs: {
    startDate: 'startDate' // Temporary fix for https://github.com/thymeflow/thymeflow-back/issues/2
  }
});