import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Route.extend({
  sparql: Ember.inject.service(),
  contactsQuery: `
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?agent 
(SAMPLE(?image) as ?image)
(SAMPLE(?email) as ?email) 
(SAMPLE(?name) as ?name) 
?accountName 
?serviceName
WHERE {
 ?document personal:documentOf/personal:sourceOf ?account .
 ?account  schema:name ?accountName ;
 personal:accountOf/schema:name ?serviceName.
 ?agent a personal:PrimaryFacet .
 GRAPH ?document {
   ?agent a personal:Agent ;
      schema:name ?name ;
 }
 OPTIONAL {
   ?agent personal:sameAs*/schema:image ?image .
 }
 OPTIONAL {
   ?agent schema:email/schema:name ?email .
 }
} GROUP BY ?agent ?accountName ?serviceName ORDER BY ?name`,
  model(){
    return DS.PromiseObject.create({
      promise: this.get('sparql')
        .query(this.get('contactsQuery'))
        .then(function(queryResult){
          return queryResult.result.results.bindings;
        }).then((contacts) => {
          return contacts.map((contact) => {
            let email = null;
            if(contact.email != null){
              email = contact.email.value;
            }
            let image = null;
            if(contact.image != null){
              image = contact.image.value;
            }
            return {
              agent: contact.agent.value,
              name: contact.name.value,
              email: email,
              image: image,
              account: contact.accountName.value,
              service: contact.serviceName.value
            };
          });
        })
    });
  },
});
