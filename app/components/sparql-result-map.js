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
  }.property(),
  content: function () {
    const removePrefix = this.get('removePrefix');
    const result = this.get('result');
    const columns = result.head.vars;
    return result.results.bindings.map(binding => {
      let longitude = null;
      let latitude = null;
      const result = {};
      result.attributes = columns.map(columnName => {
        // copy the column value
        let valueForColumn = binding[columnName];
        if (valueForColumn != null) {
          valueForColumn = Object.assign({}, valueForColumn);
          valueForColumn.value = removePrefix(valueForColumn.value);
          switch (columnName) {
            case 'longitude':
              longitude = Number(valueForColumn.value);
              break;
            case 'latitude':
              latitude = Number(valueForColumn.value);
              break;
            default:
              break;
          }
        }
        return valueForColumn;
      });
      if (longitude != null && latitude != null) {
        result.geometry = new ol.geom.Point([longitude, latitude]);
      }
      return result;
    });
  }.property('result'),
  imageFillColor: '#37abc8',
  imageStrokeColor: '#164450',
  font: '15px sans-serif',
  imageSizePerLetter: 5,
  imageStrokeWidth: 1,
  imageBaseRadius: 2,
  imageMinimumRadius: 10,
  clusterDistance: 20,
  selectedImageFillColor: '#164450',
  selectedImageStrokeColor: '#164450',
  selectedImageStrokeWidth: 1,
  selectedImageExtraRadius: 2,
  textFillColor: '#FFFFFF',
  geometryPath: "geometry",
  observesSelectedElement: function () {
    const source = this.get('source');
    if (source != null) {
      source.dispatchEvent("change");
    }
  }.observes('selectedElement'),
  style: (function () {
    const imageFill = new ol.style.Fill({
      color: this.get('imageFillColor')
    });
    const imageStroke = new ol.style.Stroke({
      color: this.get('imageStrokeColor'),
      width: this.get('imageStrokeWidth')
    });
    const imageBaseRadius = this.get('imageBaseRadius');
    const selectedImageFill = new ol.style.Fill({
      color: this.get('selectedImageFillColor')
    });
    const selectedImageStroke = new ol.style.Stroke({
      color: this.get('selectedImageStrokeColor'),
      width: this.get('selectedImageStrokeWidth')
    });
    const imageMinimumRadius = this.get('imageMinimumRadius');
    const selectedImageExtraRadius = this.get('selectedImageExtraRadius');
    const imageSizePerLetter = this.get('imageSizePerLetter');
    const textFill = new ol.style.Fill({
      color: this.get('textFillColor')
    });
    const self = this;
    const font = this.get('font');
    var styleCache = {};
    return function (featuresFeature) {
      let features = featuresFeature.get('features');
      if (!features) {
        features = [featuresFeature];
      }
      const selectedElement = self.get('selectedElement');
      let isSelected = false;
      let text = "";
      features.forEach((feature) => {
        const data = feature.get("data");
        if (data === selectedElement) {
          isSelected = true;
        }
      });
      if (features.length > 1) {
        text = `${features.length}`;
      }
      let imageStyle = styleCache[text.length + "," + isSelected + ","];
      if (!imageStyle) {
        if (isSelected) {
          imageStyle = new ol.style.Circle({
            radius: Math.max(imageMinimumRadius + selectedImageExtraRadius, imageBaseRadius + selectedImageExtraRadius + text.length * imageSizePerLetter),
            fill: selectedImageFill,
            stroke: selectedImageStroke
          });
        } else {
          imageStyle = new ol.style.Circle({
            radius: Math.max(imageMinimumRadius, imageBaseRadius + text.length * imageSizePerLetter),
            fill: imageFill,
            stroke: imageStroke
          });
        }
        styleCache[text.length + "," + isSelected] = imageStyle;
      }
      return [new ol.style.Style({
        image: imageStyle,
        text: new ol.style.Text({
          font: font,
          text: String(text),
          fill: textFill,
          textAlign: 'center'
        })
      })];
    };
  }).property()

});
