import Ember from "ember";
import ENV from 'thymeflow-front/config/environment';

export default Ember.Controller.extend({
   apiEndpoint: ENV.APP.API_ENDPOINT,
   fileUploadSuccess: null,
   fileUploadError: null,
   actions:{
      fileUploadStarted(data){
         this.setProperties({
            fileUploadFilename: data.filename,
            fileUploadError: null,
            fileUploadSuccess: null
         });
      },
      fileUploadSuccess(){
         this.setProperties({
            fileUploadSuccess: true
         });
      },
      fileUploadError(data){
         this.setProperties({
            fileUploadError: data.error
         });
      }
   }
});
