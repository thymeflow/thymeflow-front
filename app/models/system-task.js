import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr(),
  name: DS.attr(),
  startDate: DS.attr(),
  progress: DS.attr(),
  status: DS.attr()
});