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
      dataType: 'json',
      method: 'POST'
    }).then(result => ({content: result}), jqXHR => ({error: jqXHR.responseText}));
  }
});