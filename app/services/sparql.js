import Ember from "ember";
import DS from 'ember-data';
import ENV from "thymeflow-front/config/environment";
import {ajax} from "thymeflow-front/utilities/jquery";
import sparqljs from 'sparqljs';

const sparqlResult = DS.PromiseObject;

export default Ember.Service.extend({
  sparqlHistory: Ember.inject.service(),
  removePrefix: function (parsedQuery) {
    if (parsedQuery != null) {
      return function (url) {
        if (url != null) {
          for (let prefix in parsedQuery.prefixes) {
            if(parsedQuery.prefixes.hasOwnProperty(prefix)){
              const prefixUrl = parsedQuery.prefixes[prefix];
              if (url.startsWith(prefixUrl)) {
                return `${prefix}:${url.slice(prefixUrl.length)}`;
              }
            }
          }
        }
        return url;
      };
    }
    return (url) => url;
  },
  parseQuery: function (sparqlQuery) {
    const parser = new sparqljs.Parser();
    return parser.parse(sparqlQuery);
  },
  query: function (sparqlQuery) {
    try{
      const parsedQuery = this.parseQuery(sparqlQuery);
      this.get('sparqlHistory').add(sparqlQuery, parsedQuery);
      let requestData = {};
      let accept = 'text/plain';
      let dataType = 'text';
      if (parsedQuery.type === "update") {
        requestData.update = sparqlQuery;
      } else {
        dataType = 'json';
        requestData.query = sparqlQuery;
        switch (parsedQuery.queryType){
          case "SELECT":
          case "ASK":
            accept = 'application/sparql-results+json';
            break;
          case "CONSTRUCT":
            accept = 'application/rdf+json';
            break;
          default:
            // will not execute
        }
      }
      const resultPromise = ajax(`${ENV.APP.API_ENDPOINT}/sparql`, {
        data: requestData,
        dataType: dataType,
        method: 'POST',
        headers:{
          'Accept': `${accept}`
        }
      }).then(result => {
        if (result != null) {
          return {
            result: result
          };
        } else {
          throw Error("Oops! Something wrong happened.");
        }
      }, function(jqXHR){
        if(jqXHR.status === 0){
          throw Error("Network error.");
        }else{
          if (jqXHR.responseText != null){
            throw Error(jqXHR.responseText);
          } else {
            throw Error("Oops! Something wrong happened.");
          }
        }
      });
      return sparqlResult.create({
        type: parsedQuery.type,
        queryType: parsedQuery.queryType,
        removePrefix: this.removePrefix(parsedQuery),
        promise: resultPromise
      });
    } catch (err) {
      return sparqlResult.create({
        promise: Ember.RSVP.Promise.reject(Error(err.message))
      });
    }
  }
});
