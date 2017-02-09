import Ember from "ember";
import DS from 'ember-data';
import ENV from "thymeflow-front/config/environment";
import {ajax} from "thymeflow-front/utilities/jquery";
/* global sparqljs */

const sparqlResult = DS.PromiseObject;

export default Ember.Service.extend({
  sparqlHistory: Ember.inject.service(),
  removePrefix: function (parsedQuery) {
    if (parsedQuery != null) {
      return function (url) {
        if (url != null) {
          for (var prefix in parsedQuery.prefixes) {
            const prefixUrl = parsedQuery.prefixes[prefix];
            if (url.startsWith(prefixUrl)) {
              return `${prefix}:${url.slice(prefixUrl.length)}`;
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
      if (parsedQuery.type === "update") {
        requestData.update = sparqlQuery;
      } else {
        requestData.query = sparqlQuery;
      }
      const resultPromise = ajax(`${ENV.APP.API_ENDPOINT}/sparql`, {
        data: requestData,
        method: 'POST'
      }).then(result => {
        if (result != null) {
          var queryType = "";
          if (result.head && result.head.vars) {
            queryType = "SELECT";
          } else if (typeof result.boolean === "boolean") {
            queryType = "ASK";
          } else if (result === "") {
            queryType = "UPDATE";
          } else {
            queryType = "CONSTRUCT";
          }
          return {
            queryType: queryType,
            result: result,
            query: parsedQuery,
            removePrefix: this.removePrefix(parsedQuery)
          };
        } else {
          return {};
        }
      }, function(jqXHR){
        if(jqXHR.status === 0){
          throw "Network error.";
        }else{
          if (jqXHR.responseText != null){
            throw jqXHR.responseText;
          } else {
            throw "Oops! Something wrong happened.";
          }
        }
      });
      return sparqlResult.create({
        promise: resultPromise
      });
    } catch (err) {
      return sparqlResult.create({
        promise: Ember.RSVP.Promise.reject(err.message)
      });
    }
  }
});