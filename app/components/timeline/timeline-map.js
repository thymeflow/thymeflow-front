import Ember from 'ember';
import LocationsStyle from './styles/locations';
import MovesStyle from './styles/moves';
import StaysStyle from './styles/stays';


export default Ember.Component.extend({
  classNameBindings: ['details:details'],
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
      filterLocationIntervalBinding: "component.filterLocationInterval",
      showLocationAccuracyBinding: "component.showLocationAccuracy"
    });
  }.property(),
  movesStyle: function(){
    return new MovesStyle({
      component: this,
      selectedStayMoveBinding: "component.selectedStayMove"
    });
  }.property(),
  staysStyle: function(){
    return new StaysStyle({
      component: this,
      selectedStayMoveBinding: "component.selectedStayMove"
    });
  }.property(),
  actions: {
    onMapCreated: function(map){
      this.set('map', map);
    },
    onSourcePopulated: function(map, layer){
      map.fitViewToExtent(layer.getExtent());
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