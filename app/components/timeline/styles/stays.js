import Ember from 'ember';
import ol from 'ol';

export default Ember.Object.extend({
  imageFillColor: '#37abc8',
  imageStrokeColor: '#164450',
  imageStrokeWidth: 1,
  imageRadius: 15,
  selectedImageFillColor: '#164450',
  selectedImageStrokeColor: '#164450',
  selectedImageStrokeWidth: 1,
  selectedImageRadius: 15,
  eventImageFillColor: '#c84137',
  eventImageStrokeColor: '#501a16',
  eventImageStrokeWidth: 1,
  eventImageRadius: 15,
  selectedEventImageFillColor: '#501a16',
  selectedEventImageStrokeColor: '#501a16',
  selectedEventImageStrokeWidth: 1,
  selectedEventImageRadius: 15,
  clusterDistance: 20,
  textFillColor: '#FFFFFF',
  imageFillStyle: function() {
    return new ol.style.Fill({
      color: this.get('imageFillColor')
    });
  }.property(),
  imageStrokeStyle: function() {
    return new ol.style.Stroke({
      color: this.get('imageStrokeColor'),
      width: this.get('imageStrokeWidth')
    });
  }.property(),
  selectedImageFillStyle: function() {
    return new ol.style.Fill({
      color: this.get('selectedImageFillColor')
    });
  }.property(),
  selectedImageStrokeStyle: function() {
    return new ol.style.Stroke({
      color: this.get('selectedImageStrokeColor'),
      width: this.get('selectedImageStrokeWidth')
    });
  }.property(),
  textFillStyle: function() {
    return new ol.style.Fill({
      color: this.get('textFillColor')
    });
  }.property(),
  eventImageFillStyle: function() {
    return new ol.style.Fill({
    color: this.get('eventImageFillColor')
  });
  }.property(),
  eventImageStrokeStyle: function() {
    return new ol.style.Stroke({
      color: this.get('eventImageStrokeColor'),
      width: this.get('eventImageStrokeWidth')
    });
  }.property(),
  selectedEventImageFillStyle: function() {
    return new ol.style.Fill({
      color: this.get('selectedEventImageFillColor')
    });
  }.property(),
  selectedEventImageStrokeStyle: function() {
    return new ol.style.Stroke({
      color: this.get('selectedEventImageStrokeColor'),
      width: this.get('selectedEventImageStrokeWidth')
    });
  }.property(),
  style: (function() {
    const imageFillStyle = this.get('imageFillStyle');
    const imageStrokeStyle = this.get('imageStrokeStyle');
    const imageRadius = this.get('imageRadius');
    const selectedImageFillStyle = this.get('selectedImageFillStyle');
    const selectedImageStrokeStyle = this.get('selectedImageStrokeStyle');
    const selectedImageRadius = this.get('selectedImageRadius');
    const eventImageFillStyle = this.get('eventImageFillStyle');
    const eventImageStrokeStyle = this.get('eventImageStrokeStyle');
    const eventImageRadius = this.get('eventImageRadius');
    const selectedEventImageFillStyle = this.get('selectedEventImageFillStyle');
    const selectedEventImageStrokeStyle = this.get('selectedEventImageStrokeStyle');
    const selectedEventImageRadius = this.get('selectedEventImageRadius');
    const textFillStyle = this.get('textFillStyle');
    const selectedStayMove = this.get('selectedStayMove');
    const styleCache = {};
    const showEvents = this.get('showEvents');
    function getImageStyle(text, imageRadius, imageFillStyle, imageStrokeStyle){
      return new ol.style.Circle({
        radius: imageRadius + (text.length - 1) * imageRadius * 0.15,
        fill: imageFillStyle,
        stroke: imageStrokeStyle
      });
    }
    return function(featuresFeature){
      let features = featuresFeature.get('features');
      let hasEvents = false;
      if(!features){
        features = [featuresFeature];
      }
      let isSelected = false;
      let text = "";
      const featureArray = features.map((feature) => {
        const data = feature.get("data");
        if(data === selectedStayMove){
          isSelected = true;
        }
        if(showEvents && data.get('events.length') > 0){
          hasEvents = true;
        }
        return data.get('index');
      });
      if(featureArray.length > 4){
        text = `${featureArray[0]},...,${featureArray[features.length - 1]}`;
      }else{
        text = featureArray.join(",");
      }
      const cacheKey = text.length + "," + isSelected + "," + hasEvents;
      var imageStyle = styleCache[cacheKey];
      if(!imageStyle){
        if(isSelected) {
          if(hasEvents){
            imageStyle = getImageStyle(text, selectedEventImageRadius, selectedEventImageFillStyle, selectedEventImageStrokeStyle);
          }else{
            imageStyle = getImageStyle(text, selectedImageRadius, selectedImageFillStyle, selectedImageStrokeStyle);
          }
        }else{
          if(hasEvents){
            imageStyle = getImageStyle(text, eventImageRadius, eventImageFillStyle, eventImageStrokeStyle);
          }else{
            imageStyle = getImageStyle(text, imageRadius, imageFillStyle, imageStrokeStyle);
          }
        }
        styleCache[cacheKey] = imageStyle;
      }
      return [new ol.style.Style({
        image: imageStyle,
        text: new ol.style.Text({
          font: '20px Calibri,sans-serif',
          text: String(text),
          fill: textFillStyle
        })
      })];
    };
  }).property('selectedStayMove', 'showEvents')
});