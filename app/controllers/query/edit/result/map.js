import Ember from "ember";

export default Ember.Controller.extend({
  queryController: Ember.inject.controller('query.edit'),
  queryResult: Ember.computed.readOnly('queryController.query.result'),
  queryType: Ember.computed.readOnly('queryResult.queryType'),
  queryResultContent: Ember.computed.readOnly('queryResult.result'),
  queryRemovePrefix: Ember.computed.readOnly('queryResult.removePrefix')
});
