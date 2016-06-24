import Ember from "ember";
import ENV from 'thymeflow-front/config/environment';

export default Ember.Controller.extend({
   apiEndpoint: ENV.APP.API_ENDPOINT
});
