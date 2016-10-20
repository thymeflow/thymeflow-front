import Ember from "ember";

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  query: Ember.computed.alias('model'),
  error: Ember.computed.readOnly('query.result.reason'),
  errorLines: Ember.computed('error', function(){
    if(this.get('error') != null){
      return this.get('error').split('\n');
    }else{
      return [];
    }
  }),
  queryContent: Ember.computed('query.queryContent', {
    get() {
      return this.get('query.queryContent');
    },
    set(_, value) {
      const query = this.get('query');
      query.set('draft', value);
      return value;
    }
  }),
  queriesSorting: ['name'],
  sortedQueries: Ember.computed.sort('filteredQueries', 'queriesSorting'),
  filteredQueries: Ember.computed.filter('allQueries', query => query.get('id') !== 'new'),
  allQueries: function () {
    return this.store.findAll('sparql-query');
  }.property(),
  selectedQuery: Ember.computed('query', function(){
    const query = this.get('query');
    if(query.get('id') !== 'new'){
      return query;
    }else{
      return null;
    }
  }),
  actions: {
    save(){
      const query = this.get('query');
      if (query != null) {
        // save query content
        query.set('content', this.get('queryContent'));
        query.save();
      }
    },
    saveByName(queryName, queryContent) {
      if (queryName != null && queryName.length > 0) {
        const id = queryName;
        this.store.findRecord('sparql-query', id)
          .catch(() => {
            // In case a query with the same name does not exist,
            // we must unload the record created by the find method
            // This is due to a problem with Ember-Data https://github.com/emberjs/data/issues/4424
            // and ember-local-storage's behaviour
            const queryModel = this.store.recordForId('sparql-query', id);
            queryModel.unloadRecord();
            return this.store.createRecord('sparql-query', {id: id});
          }).then((queryModel) => {
            queryModel.set('content', queryContent);
            return queryModel.save();
          }).then(queryModel => this.transitionToRoute('query.edit', queryModel));
      }
    },
    createOnEnter(select, e) {
      if (e.keyCode === 13 && select.isOpen && !select.highlighted && !Ember.isBlank(select.searchText)) {
        const queryContent = this.get('queryContent');
        this.set('query', null);
        this.send('saveByName', select.searchText, queryContent);
      }
    },
    undo(){
      const query = this.get('query');
      this.set('queryContent', query.get('content'));
    },
    delete(){
      const query = this.get('query');
      query.destroyRecord();
      this.transitionToRoute('query.new');
    },
    selectQuery(query) {
      this.transitionToRoute('query.edit', query);
    }
  }
});
