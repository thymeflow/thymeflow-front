import Ember from 'ember';
import ol from 'ol';

export default Ember.Object.extend({
  imageFillColor: '#37abc8',
  imageStrokeColor: '#164450',
  imageStrokeWidth: 1,
  imageRadius: 15,
  clusterDistance: 20,
  selectedImageFillColor: '#164450',
  selectedImageStrokeColor: '#164450',
  selectedImageStrokeWidth: 1,
  selectedImageRadius: 15,
  textFillColor: '#FFFFFF',
  imageStrokeStyle: function() {
    return new ol.style.Stroke({
      color: this.get('imageStrokeColor'),
      width: this.get('imageStrokeWidth')
    });
  }.property(),
  imageFill: function() {
    return new ol.style.Fill({
      color: this.get('imageFillColor')
    });
  }.property(),
  selectedImageFill: function() {
    return new ol.style.Fill({
      color: this.get('selectedImageFillColor')
    });
  }.property(),
  selectedImageStroke: function() {
    return new ol.style.Stroke({
      color: this.get('selectedImageStrokeColor'),
      width: this.get('selectedImageStrokeWidth')
    });
  }.property(),
  textFill: function() {
    return new ol.style.Fill({
      color: this.get('textFillColor')
    });
  }.property(),
  style: (function() {
    const imageFill = this.get('imageFill');
    const imageStroke = this.get('imageStrokeStyle');
    const imageRadius = this.get('imageRadius');
    const selectedImageFill = this.get('selectedImageFill');
    const selectedImageStroke = this.get('selectedImageStroke');
    const selectedImageRadius = this.get('selectedImageRadius');
    const textFill = this.get('textFill');
    const selectedStayMove = this.get('selectedStayMove');
    var styleCache = {};
    return function(featuresFeature){
      var features = featuresFeature.get('features');
      if(!features){
        features = [featuresFeature];
      }
      var isSelected = false;
      var text = "";
      var featureArray = features.map((feature) => {
        const data = feature.get("data");
        if(data === selectedStayMove){
          isSelected = true;
        }
        return data.get('index');
      });
      if(featureArray.length > 4){
        text = `${featureArray[0]},...,${featureArray[features.length - 1]}`;
      }else{
        text = featureArray.join(",");
      }
      var imageStyle = styleCache[text.length + "," + isSelected];
      if(!imageStyle){
        if(isSelected) {
          imageStyle = new ol.style.Circle({
            radius: selectedImageRadius + (text.length - 1) * selectedImageRadius * 0.15,
            fill: selectedImageFill,
            stroke: selectedImageStroke
          });
        }else{
          imageStyle = new ol.style.Circle({
            radius: imageRadius + (text.length - 1) * imageRadius * 0.15,
            fill: imageFill,
            stroke: imageStroke
          });
        }
        styleCache[text.length + "," + isSelected] = imageStyle;
      }
      return [new ol.style.Style({
        image: imageStyle,
        text: new ol.style.Text({
          font: '20px Calibri,sans-serif',
          text: String(text),
          fill: textFill
        })
      })];
    };
  }).property('selectedStayMove')
});