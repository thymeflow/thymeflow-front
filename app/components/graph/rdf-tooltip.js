import Ember from "ember";

export default Ember.Component.extend({
  attributeBindings: ["style"],
  classNames: "graph-tooltip n",
  renderedData: null,
  style: function () {
    const renderedData = this.get('renderedData');
    const show = renderedData != null;
    const top = show ? this.get('top') : 0;
    const left = show ? this.get('left') : 0;
    return Ember.String.htmlSafe(`position: absolute; opacity: ${(show) ? 1 : 0}; pointer-events: ${(show) ? "all" : "none"}; box-sizing: border-box; top: ${top}px; left: ${left}px`);
  }.property('renderedData', 'top', 'left'),
  width: 0,
  height: 0,
  left: function () {
    return this.get('x') - this.get('width') / 2;
  }.property('x', 'width'),
  top: function () {
    return this.get('y') - this.get('height');
  }.property('y', 'height'),
  onDidRender: function () {
    const element = this.get("element");
    const height = element.offsetHeight;
    const width = element.offsetWidth;
    const renderedData = this.get('renderedData');
    const data = this.get('data');
    if (data !== renderedData) {
      Ember.run.schedule('actions', () => {
        this.setProperties({
          renderedData: data,
          width: width,
          height: height
        });
      });
    }
  }.on('didRender'),
  observesData: function () {
    const data = this.get('data');
    if (data == null) {
      this.set('renderedData', null);
    }
  }.observes('data'),
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
