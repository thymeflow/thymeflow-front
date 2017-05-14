import Ember from 'ember';
import ol from 'ol';
import d3 from 'd3';

const colorScale2 = d3.scale.linear()
  .domain([0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0])
  .range(["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"]);

function t(t){
  return function(e,i){
    e=d3.hsl(e);
    i=d3.hsl(i);
    var r=(e.h+120)*a,h=(i.h+120)*a-r,s=e.s,l=i.s-s,o=e.l,u=i.l-o;
    return isNaN(l)&&(l=0,s=isNaN(s)?i.s:s),isNaN(h)&&(h=0,r=isNaN(r)?i.h:r),
      function(a){var e=r+h*a,i=Math.pow(o+u*a,t),c=(s+l*a)*i*(1-i);
        return"#"+n(i+c*(-0.14861*Math.cos(e)+1.78277*Math.sin(e)))+n(i+c*(-0.29227*Math.cos(e)-0.90649*Math.sin(e)))+n(i+c*1.97294*Math.cos(e));
    };
  };
}
function n(t){
  var n=(t=0>=t?0:t>=1?255:0|255*t).toString(16);
  return 16>t?"0"+n:n;
}
var a=Math.PI/180;
d3.scale.cubehelix=function(){
  return d3.scale.linear().range([d3.hsl(300,0.5,0),d3.hsl(-240,0.5,1)]).interpolate(d3.interpolateCubehelix);
};
d3.interpolateCubehelix=t(1);
d3.interpolateCubehelix.gamma=t;

const colorScale4 = d3.scale.cubehelix()
  .domain([0, 0.5, 1.0])
  .range([
    d3.hsl(-100, 0.75, 0.35),
    d3.hsl(  80, 1.50, 0.80),
    d3.hsl( 260, 0.75, 0.35)
  ]);

function colorScale(t){
  return colorScale4(t * 260/360 + 100/360);
}

const colorScale5 = function(t) {
  return d3.hsl(t * 360, 1, 0.5).toString();
};

export default Ember.Object.extend({
  normalStyle: new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({
      color: "#57b9d1"
    }),
    stroke: new ol.style.Stroke({
      color: "#0c262c",
      width: 1
    })
  }),
  selectedStyle: new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({
      color: "#0c262c"
    }),
    stroke: new ol.style.Stroke({
      color: "#040e10",
      width: 1
    })
  }),
  accuracyStrokeStyle: new ol.style.Stroke({
      color: "#040e10",
      width: 1
    }),
  deselectedStyle: new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({
      color: "#57b9d1"
    }),
    stroke: new ol.style.Stroke({
      color: "#0c262c",
      width: 1
    })
  }),
  filterLocationInterval: Ember.K,
  showLocationAccuracy: Ember.K,

  style: function() {

    const strokeWidth = 1;
    const radius = 3;
    const fromTime = this.get('fromTime').valueOf();
    const toTime = this.get('toTime').valueOf();
    let range = toTime - fromTime;
    range = range === 0 ? 1.0 : range;
    return function(feature/*, resolution*/) {
      let location = feature.get('data');
      const relative = Math.max(0, Math.min((location.time - fromTime)/range, 1));
      const color = colorScale(relative);
      let circle = new ol.style.Circle({
        radius: radius,
        fill: new ol.style.Fill({
          color: color,
        }),
        stroke: new ol.style.Stroke({
          color: d3.rgb(color).darker(1).toString(),
          width: strokeWidth,
        })
      });
      //circle.setOpacity(0.8);

      return new ol.style.Style({image: circle});
    };
  }.property('from', 'to'),
  style2: (function() {
    const normalStyle = new ol.style.Style({
      image: this.get('normalStyle')
    });
    const selectedStyle = new ol.style.Style({
      image: this.get('selectedStyle')
    });
    const deselectedStyle = new ol.style.Style({
      image: this.get('deselectedStyle')
    });
    const accuracyStrokeStyle = this.get('accuracyStrokeStyle');
    function accuracyStyle(feature, accuracy) {
      return new ol.style.Style({
        geometry: new ol.geom.Circle(feature.getGeometry().getFirstCoordinate(), accuracy),
        stroke: accuracyStrokeStyle
      });
    }
    const { "filterLocationInterval": filterLocationInterval,
      "showLocationAccuracy":showLocationAccuracy } = this.getProperties("filterLocationInterval", 'showLocationAccuracy');
    return function(feature){
      const data = feature.get("data");
      const accuracy = data.accuracy || 15.0;
      if(filterLocationInterval != null){
        const {from, to} = filterLocationInterval.getProperties("from", "to");
        const time = data.time;
        if(time.isBetween(from,to) || time.isSame(from) || time.isSame(to)){
          if(showLocationAccuracy && accuracy){
            return [selectedStyle, accuracyStyle(feature,accuracy)];
          }else{
            return [selectedStyle];
          }
        }else {
          return [deselectedStyle];
        }
      }else{
        if(showLocationAccuracy && accuracy){
          return [normalStyle, accuracyStyle(feature,accuracy)];
        }else{
          return [normalStyle];
        }
      }
    };
  }).property('filterLocationInterval', 'showLocationAccuracy')
});
