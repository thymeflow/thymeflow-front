import Ember from "ember";
import ENV from "thymeflow-front/config/environment";
import {ajax} from "thymeflow-front/utilities/jquery";

export default Ember.Service.extend({
  query: function (sparqlQuery) {
    let requestData = {};
    if (sparqlQuery.includes('SELECT') || sparqlQuery.includes('CONSTRUCT') || sparqlQuery.includes('DESCRIBE') || sparqlQuery.includes('ASK')) {
      requestData.query = sparqlQuery;
    } else {
      requestData.update = sparqlQuery;
    }
    return ajax(`${ENV.APP.API_ENDPOINT}/sparql`, {
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
        return {queryType: queryType, content: result};
      } else {
        return {};
      }
    }, jqXHR => ({error: jqXHR.responseText}));
  }
});