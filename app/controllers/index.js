import Ember from "ember";
import ENV from 'thymeflow-front/config/environment';

export default Ember.Controller.extend({
   apiEndpoint: ENV.APP.API_ENDPOINT,
   fileUploadName: null,
   actions:{
      fileUploadChanged(fileUploadName){
         this.set('fileUploadName', fileUploadName);
      }
   }
});
