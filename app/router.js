import Ember from "ember";
import config from "./config/environment";

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('query', function () {
    this.route('new');
    this.route('edit', {path: '/q/:query_name'}, function(){
      this.route('result', function(){
        this.route('table');
        this.route('graph');
        this.route('map');
      });
    });
  });

  this.route('contacts', function(){
    this.route('item', {path: ':contact_id'}, function(){

    });
  });

  this.route('timeline', function(){
  });
});

export default Router;
