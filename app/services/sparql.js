import Ember from "ember";
import ENV from "thymeflow-front/config/environment";
import {ajax} from "thymeflow-front/utilities/jquery";
/* global sparqljs */

const sparqlResult = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin, {
});

export default Ember.Service.extend({
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
      let requestData = {};
      if (parsedQuery.queryType === "UPDATE") {
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
        throw new Error(jqXHR.responseText);
      });
      return sparqlResult.create({
        promise: resultPromise
      });
    } catch (err) {
      return {
        reason: err.message
      };
    }
  }
});