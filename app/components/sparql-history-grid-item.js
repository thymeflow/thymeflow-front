import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  tagName: 'tr',
  store: Ember.inject.service(),
  actions: {
    openQuery(){
      const store = this.get('store');
      const id = this.get('query.time').format("YYYY-MM-DDTHHmmss");
      const promise = store.findRecord('sparql-query', id)
        .catch(() => {
          // In case a query with the same name does not exist,
          // we must unload the record created by the find method
          // This is due to a problem with Ember-Data https://github.com/emberjs/data/issues/4424
          // and ember-local-storage's behaviour
          const queryModel = store.recordForId('sparql-query', id);
          queryModel.unloadRecord();
          return store.createRecord('sparql-query', {
            id: id,
            content: this.get('query.content')
          });
        });
      this.sendAction("openQuery", DS.PromiseObject.create({
        promise: promise
      }));
    }
  }
});
