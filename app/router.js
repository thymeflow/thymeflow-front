import Ember from "ember";
import config from "./config/environment";

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('sparql', function () {
    this.route('item', {path: ':query_name'});
  });

  this.route('timeline', function(){
  });
  this.route('data-services');
});

export default Router;
