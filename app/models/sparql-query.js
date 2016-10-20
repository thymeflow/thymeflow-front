import Ember from "ember";
import DS from "ember-data";

export default DS.Model.extend({
  sparql: Ember.inject.service(),
  name: Ember.computed.alias('id'),
  draft: DS.attr('string'),
  content: DS.attr('string'),
  queryContent: Ember.computed('draft', 'content', function(){
    let queryContent = this.get('draft');
    if(queryContent == null){
      queryContent = this.get('content');
    }
    return queryContent;
  }),
  result: null,
  execute: function(){
    const queryContent = this.get('queryContent');
    if(queryContent != null){
      const sparql = this.get('sparql');
      this.set('result', sparql.query(queryContent));
    }else{
      this.set('result', null);
    }
  }
});