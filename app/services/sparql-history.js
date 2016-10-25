import Ember from 'ember';
import moment from 'moment';

const SparqlHistoryItem = Ember.Object.extend({
  contentShort: Ember.computed("content", function(){
    return this.get('content').replace("\n"," ").substring(0,200);
  })
});

export default Ember.Service.extend({
  items: null,

  init() {
    this._super(...arguments);
    this.set('items', Ember.A());
  },
  add(sparqlQuery, parsedQuery) {
    this.get('items').pushObject(SparqlHistoryItem.create({
      content: sparqlQuery,
      parsed: parsedQuery,
      time: moment()
    }));
  },
  clear: function() {
    this.get('items').clear();
  }
});
