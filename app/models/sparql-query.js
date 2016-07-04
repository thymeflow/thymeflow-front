import Ember from "ember";
import DS from "ember-data";

export default DS.Model.extend({
  name: Ember.computed.alias('id'),
  content: DS.attr('string')
});