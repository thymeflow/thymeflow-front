import Ember from "ember";
import DS from 'ember-data';
const sourceRegex = /^http:\/\/thymeflow\.com\/personal#Service\/([^/]*)\/([^/]*)\/([^/]*)/;

function parseSourceUri(sourceUri){
  const m = sourceUri.match(sourceRegex);
  return {
    service: decodeURIComponent(m[1]),
    account: decodeURIComponent(m[2]),
    source: decodeURIComponent(m[3])
  };
}

export default Ember.Service.extend({
  sparql: Ember.inject.service(),
  contactsQuery: `
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>

SELECT ?agent 
(SAMPLE(?email) as ?email) 
(SAMPLE(?mainEmail) as ?mainEmail)
(SAMPLE(?name) as ?name)
(SAMPLE(?mainName) as ?mainName)
(SAMPLE(?image) as ?image)
(GROUP_CONCAT(DISTINCT ?source; separator = " ") as ?sourceAccountServices)
WHERE {
 ?agent a personal:PrimaryFacet .
 ?agent a personal:Agent .
 OPTIONAL{
    ?agent schema:name ?mainName .
 }
 OPTIONAL{
    ?agent schema:email/schema:name ?mainEmail .
 }
 ?agent personal:sameAs* ?equivalentAgent .
      
      GRAPH ?document {
         ?equivalentAgent a personal:Agent .
      }
      
      ?document personal:documentOf ?source .
    
 OPTIONAL {
   ?equivalentAgent  schema:image ?image .
 }
 OPTIONAL {
   ?equivalentAgent  schema:email/schema:name ?email .
 }
 OPTIONAL {
   ?equivalentAgent  schema:name ?name .
 }
} GROUP BY ?agent`,
  all: Ember.computed(function(){
    return DS.PromiseObject.create({
      promise: this.get('sparql')
        .query(this.get('contactsQuery'))
        .then(function(queryResult){
          return queryResult.result.results.bindings;
        }).then((contacts) => {
          return contacts.map((contact) => {
            let email = null;
            if(contact.mainEmail != null){
              email = contact.mainEmail.value;
            }
            if(email == null && contact.email != null){
              email = contact.email.value;
            }
            let image = null;
            if(contact.image != null){
              image = contact.image.value;
            }
            let name = null;
            if(contact.mainName != null){
              name = contact.mainName.value;
            }
            if(name == null && contact.name != null){
              name = contact.name.value;
            }
            const sourceAccountServices = contact.sourceAccountServices.value.split(' ').map(parseSourceUri);
            return {
              agent: contact.agent.value,
              route: encodeURIComponent(contact.agent.value),
              name: name,
              sortField: (name != null)?name.trim().toLowerCase():((email != null)?email.trim().toLowerCase():""),
              email: email,
              image: image,
              sourceAccountServices: sourceAccountServices
            };
          });
        })
    });
  })
});