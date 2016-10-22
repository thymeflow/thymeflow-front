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
  ?equivalentAgent personal:service ?serviceName .
  ?equivalentAgent personal:account ?accountName .
  ?equivalentAgent personal:source ?sourceName .
  ?equivalentAgent schema:name ?name .
  ?equivalentAgent schema:givenName ?givenName .
  ?equivalentAgent schema:familyName ?familyName .
  ?equivalentAgent schema:telephone ?telephone .
  ?equivalentAgent schema:image ?image .
  ?equivalentAgent schema:email ?email .
} WHERE {
  <${contactId}> personal:sameAs* ?equivalentAgent .
  OPTIONAL {
    GRAPH ?document {
      ?equivalentAgent a personal:Agent .
    }
    ?document personal:documentOf ?source .
    ?source schema:name ?sourceName ;
            personal:sourceOf ?account .
    ?account schema:name ?accountName ;
             personal:accountOf/schema:name ?serviceName .
  }
  OPTIONAL {
    ?equivalentAgent schema:name ?name .
  }
  OPTIONAL{
    ?equivalentAgent schema:givenName ?givenName .
  }
  OPTIONAL{
    ?equivalentAgent schema:familyName ?familyName .
  }
  OPTIONAL {
    ?equivalentAgent schema:telephone/schema:name ?telephone . 
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
    let contactId = params.contact_id;
    if(contactId != null){
      // big hack, to counter a bug with Ember.js ..
      contactId = contactId.replace("%40", "%2540");
      contactId = decodeURIComponent(contactId);
      const sparql = this.get('sparql');
      return DS.PromiseObject.create({
        promise: sparql.query(this.contactQuery(contactId)).then(results =>{
          const schemaOrg = "http://schema.org/";
          const personal = "http://thymeflow.com/personal#";
          const graph = results.result;
          const fieldMap = new Map();
          function addField(subject, property){
            let propertyName = 'unknown';
            switch(property){
              case `${personal}service`:
                propertyName = "service";
                break;
              case `${personal}account`:
                propertyName = "account";
                break;
              case `${personal}source`:
                propertyName = "source";
                break;
              case `${schemaOrg}email`:
                propertyName = "email";
                break;
              case `${schemaOrg}familyName`:
                propertyName = "familyName";
                break;
              case `${schemaOrg}givenName`:
                propertyName = "givenName";
                break;
              case `${schemaOrg}telephone`:
                propertyName = "telephone";
                break;
              case `${schemaOrg}image`:
                propertyName = "image";
                break;
              case `${personal}sameAs`:
                propertyName = "sameAs";
                break;
              case `${schemaOrg}name`:
                propertyName = "name";
                break;
              default:
            }
            let fields = fieldMap.get(propertyName);
            if(fields == null){
              fields = Ember.A();
              fieldMap.set(propertyName, fields);
            }
            return object => {
              fields.push({
                value: object.value,
                source: subject
              });
            };
          }
          for(let subject in graph){
            if(graph.hasOwnProperty(subject)){
              for(let property in graph[subject]){
                if(graph[subject].hasOwnProperty(property)){
                  graph[subject][property].forEach(addField(subject, property));
                }
              }
            }
          }
          const serviceMap = new Map();
          const accountMap = new Map();
          const sourceMap = new Map();
          let name = '';
          if(contactId in graph){
            if(`${schemaOrg}name` in graph[contactId]){
              name = graph[contactId][`${schemaOrg}name`][0];
              if(name != null){
                name = name.value;
              }else{
                name = '';
              }
            }
          }
          let images = fieldMap.get('image');
          if(images == null){
            images = [];
          }else{
            images = images.map(image => image.value);
          }
          let services = fieldMap.get('service');
          if(services != null){
            services.forEach(source => serviceMap.set(source.source, source.value));
          }
          let accounts = fieldMap.get('account');
          if(accounts != null){
            accounts.forEach(account => accountMap.set(account.source, account.value));
          }
          let sources = fieldMap.get('source');
          if(sources != null){
            sources.forEach(source => sourceMap.set(source.source, source.value));
          }
          let fields = Ember.A();
          function fillField(value){
            return {
              value: value.value,
              account: accountMap.get(value.source),
              service: serviceMap.get(value.source),
              source: sourceMap.get(value.source)
            };
          }
          function fillFieldSameAs(value){
            return {
              value: value.value,
              route: encodeURIComponent(value.value),
              account: accountMap.get(value.value),
              service: serviceMap.get(value.value),
              source: sourceMap.get(value.value)
            };
          }
          for (let [k, v] of fieldMap) {
            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            switch(k){
              case "sameAs":
                fields.push({
                  property: k,
                  values: v.map(fillFieldSameAs)
                });
                break;
              case "source":
              case "service":
              case "account":
                break;
              default:
                fields.push({
                  property: k,
                  values: v.map(fillField)
                });
            }
          }
          const fieldOrder = {
            email: 1,
            name: 2,
            image: 3,
            givenName: 4,
            familyName: 5,
            telephone: 6,
            sameAs: 7,
            unknown: 8
          };
          fields.forEach(function(field){
            let map = new Map();
            function processField(v){
              let e = map.get(v.value);
              if (e == null){
                e = {value: v.value,
                  sources: Ember.A()};
                map.set(v.value, e);
              }
              e.sources.push({
                account: v.account,
                service: v.service,
                type: v.source
              });
            }
            field.order = fieldOrder[field.property] || fieldOrder["unknown"];
            field.values.forEach(processField);
            field.values = Array.from(map.values());
          });
          return {
            name: name,
            images: images,
            fields: fields.sortBy('order')
          };
        })
      });
    }
  }
});
