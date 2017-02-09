import Ember from 'ember';
import LocationsStyle from './styles/locations';
import MovesStyle from './styles/moves';
import StaysStyle from './styles/stays';


export default Ember.Component.extend({
  classNameBindings: ['details:details:simple'],
  classNames: 'timeline-map',
  extent: [-20037508.34,-15037508.34,20037508.34,15037508.34],
  observeDetails: function(){
    const map = this.get('map');
    if(map != null){
      map.updateSize();
    }
  }.on('didUpdate'),
  map: null,
  staysClusterDistance: 20,
  locationsStyle: function(){
    return new LocationsStyle({
      component: this,
      filterLocationInterval: Ember.computed.oneWay("component.filterLocationInterval"),
      showLocationAccuracy: Ember.computed.oneWay("component.showLocationAccuracy")
    });
  }.property(),
  movesStyle: function(){
    return new MovesStyle({
      component: this,
      selectedStayMove: Ember.computed.oneWay("component.selectedStayMove"),
      showEvents: Ember.computed.oneWay("component.showEvents")
    });
  }.property(),
  staysStyle: function(){
    return new StaysStyle({
      component: this,
      selectedStayMove: Ember.computed.oneWay("component.selectedStayMove"),
      showEvents: Ember.computed.oneWay("component.showEvents")
    });
  }.property(),
  actions: {
    onMapCreated: function(map){
      this.set('map', map);
    },
    onLocationsPopulated: function(map, layer){
      if(this.get('stays.length') === 0) {
        map.fitViewToExtent(layer.getExtent());
      }
    },
    onStaysPopulated: function(map, layer){
      if(this.get('stays.length') > 0){
        map.fitViewToExtent(layer.getExtent());
      }
    },
    click: function (evt) {
      const stayMove = evt.map.forEachFeatureAtPixel(evt.pixel,
        function (feature /*, layer */) {
          const features = feature.get("features");
          if(features != null){
            return features[0].get("data");
          }else{
            return feature.get("data");
          }
        }, this, function(layer){
          const layerName = layer.get("name");
          return layerName === "stays" || layerName === "moves";
        }
      );
      if(stayMove != null){
        this.get('toggleSelected')(stayMove);
      }else{
        this.get('toggleSelected')(null);
      }
    }
  }
});