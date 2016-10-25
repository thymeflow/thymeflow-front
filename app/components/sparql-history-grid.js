import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['sparql-history-container'],
  sparqlHistory: Ember.inject.service(),
  queries: Ember.computed.readOnly('sparqlHistory.items'),
  actions: {
    openQuery(query) {
      this.sendAction('openQuery', query);
    }
  }
});
