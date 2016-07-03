import Ember from "ember";
import ENV from "thymeflow-front/config/environment";
import {ajax} from "thymeflow-front/utilities/jquery";
/* global sparqljs */

export default Ember.Service.extend({
  removePrefix: function (parsedQuery) {
    if (parsedQuery != null) {
      return function (url) {
        for (var prefix in parsedQuery.prefixes) {
          const prefixUrl = parsedQuery.prefixes[prefix];
          if (url.startsWith(prefixUrl)) {
            return `${prefix}:${url.slice(prefixUrl.length)}`;
          }
        }
        return url;
      };
    }
    return (url) => url;
  },
  parseQuery: function (sparqlQuery) {
    try {
      const parser = new sparqljs.Parser();
      return parser.parse(sparqlQuery);
    }
    catch (err) {
      return null;
    }
  },
  query: function (sparqlQuery) {
    const parsedQuery = this.parseQuery(sparqlQuery);
    let requestData = {};
    if (sparqlQuery.includes('SELECT') || sparqlQuery.includes('CONSTRUCT') || sparqlQuery.includes('DESCRIBE') || sparqlQuery.includes('ASK')) {
      requestData.query = sparqlQuery;
    } else {
      requestData.update = sparqlQuery;
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
          content: result,
          query: parsedQuery,
          removePrefix: this.removePrefix(parsedQuery)
        };
      } else {
        return {};
      }
    }, function(jqXHR){
      throw new Error(jqXHR.responseText);
    });
    return Ember.ObjectProxy.extend(Ember.PromiseProxyMixin, {
    }).create({
      promise: resultPromise
    });
  }
});