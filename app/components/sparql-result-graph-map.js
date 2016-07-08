import Ember from "ember";
import ol from "ol";

export default Ember.Component.extend({
  zoom: 1,
  center: [0, 0],
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
