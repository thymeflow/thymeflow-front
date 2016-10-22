import Ember from "ember";

export default Ember.Component.extend({
  tagName: "",
  service: null,
  account: null,
  sourceIcon: Ember.computed("source", function(){
    switch(this.get('source')){
      case "Facebook": return "share-alt";
      case "Calendar": return "calendar";
      case "Contacts": return "users";
      case "Emails": return "envelope";
      case "File": return "file";
      default: return "no";
    }
  }),
  serviceIcon: Ember.computed("service", function(){
    switch(this.get('service')){
      case "Facebook": return "facebook";
      case "Google": return "google";
      case "Microsoft": return "microsoft";
      case "Email": return "envelope";
      case "File": return "file";
      default: return "no";
    }
  })
});
