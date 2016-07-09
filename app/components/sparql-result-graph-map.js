import Ember from "ember";
import ol from "ol";

export default Ember.Component.extend({
  zoom: 1,
  center: [0, 0],
  logLinkDistance: 3,
  linkDistance: function () {
    return Math.pow(10, this.get('logLinkDistance'));
  }.property('logLinkDistance'),
  mapControls: function () {
    return ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }).extend([
      new ol.control.ScaleLine()
    ]);
  }.property()
});
