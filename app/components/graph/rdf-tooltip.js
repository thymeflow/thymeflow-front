import Ember from "ember";

export default Ember.Component.extend({
  attributeBindings: ["style"],
  classNames: "graph-tooltip n",
  visible: false,
  renderedData: null,
  style: function () {
    const renderedData = this.get('renderedData');
    const data = this.get('data');
    const show = (renderedData === data) ? this.get('visible') : false;
    const top = this.get('top');
    const left = this.get('left');
    return Ember.String.htmlSafe(`position: absolute; opacity: ${(show) ? 1 : 0}; pointer-events: ${(show) ? "all" : "none"}; box-sizing: border-box; top: ${top}px; left: ${left}px`);
  }.property('visible', 'top', 'left'),
  actions: {
    updateDimensions: function (width, height) {
      this.set('width', width);
      this.set('height', height);
    }
  },
  width: 0,
  height: 0,
  left: function () {
    return this.get('x') - this.get('width') / 2;
  }.property('x', 'width'),
  top: function () {
    return this.get('y') - this.get('height');
  }.property('y', 'height'),
  onDidRender: function () {
    const element = this.$().get(0);
    const height = element.offsetHeight;
    const width = element.offsetWidth;
    const renderedData = this.get('renderedData');
    const data = this.get('data');
    if (data !== renderedData) {
      this.set('renderedData', data);
      Ember.run.schedule('actions', () => this.send("updateDimensions", width, height));
    }
  }.on('didRender'),
  properties: function () {
    const propertyMap = this.get('data.properties');
    if (propertyMap != null) {
      const properties = [];
      for (var [propertyName, literals] of propertyMap.entries()) {
        properties.push({
          name: propertyName,
          literals: literals
        });
      }
      return properties;
    } else {
      return null;
    }
  }.property('data'),
  title: Ember.computed.alias('data.value'),
  isLink: function () {
    const data = this.get('data');
    if (data != null) {
      return data.isLink === true;
    } else {
      return null;
    }
  }.property('data')
});
