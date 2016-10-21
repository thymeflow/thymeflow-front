import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Route.extend({
  sparql: Ember.inject.service(),
  contactQuery(contactId){
    return `
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT {
  <${contactId}> personal:sameAs ?equivalentAgent .
  ?equivalentAgent schema:name ?name .
  ?equivalentAgent schema:givenName ?givenName .
  ?equivalentAgent schema:familyName ?familyName .
  ?equivalentAgent schema:telephone ?telephone .
  ?equivalentAgent schema:image ?image .
  ?equivalentAgent schema:email ?email .
} WHERE {
 <${contactId}> personal:sameAs* ?equivalentAgent .
 ?equivalentAgent schema:name ?name .
  OPTIONAL{
    ?equivalentAgent schema:givenName ?givenName .
  }
  OPTIONAL{
    ?equivalentAgent schema:familyName ?familyName .
  }
  OPTIONAL {
    ?equivalentAgent schema:telephone ?telephone . 
  }
  OPTIONAL {
    ?equivalentAgent schema:image ?image .
  }
  OPTIONAL {
    ?equivalentAgent schema:email/schema:name ?email .
  }
}`;
  },
  model(params){
   if(params.contact_id != null){
     const sparql = this.get('sparql');
     return DS.PromiseObject.create({
       promise: sparql.query(this.contactQuery(params.contact_id)).then(results =>{
         const graph = results.result;
         function addField(subject, property){
           return object => fields.push({
             name: property,
             value: object.value,
             source: subject
           });
         }
         const fields = Ember.A();
         for(let subject in graph){
           if(graph.hasOwnProperty(subject)){
             for(let property in graph[subject]){
               if(graph[subject].hasOwnProperty(property)){
                 graph[subject][property].forEach(addField(subject, property));
               }
             }
           }
         }
         return {
           fields: fields
         };
       })
     });
   }
  }
});
