import Ember from "ember";

export default Ember.Component.extend({
  attributeBindings: ["style"],
  classNames: "graph-tooltip n",
  renderedData: null,
  model: null,
  style: function () {
    const renderedData = this.get('renderedData');
    const show = renderedData != null;
    const top = show ? this.get('top') : 0;
    const left = show ? this.get('left') : 0;
    const maxWidth = this.get('maxWidth');
    return Ember.String.htmlSafe(`max-width: ${maxWidth}px; position: absolute; opacity: ${(show) ? 1 : 0}; pointer-events: ${(show) ? "all" : "none"}; box-sizing: border-box; top: ${top}px; left: ${left}px`);
  }.property('renderedData', 'top', 'left', 'maxWidth'),
  maxWidth: function () {
    return Math.min(this.get('documentWidth') - (this.get('model.x') - this.get('model.parentX')),
        this.get('model.x') - this.get('model.parentX')) * 2;
  }.property('documentWidth', 'model.parentX', 'model.x'),
  onResizeWindow: function () {
    return () => this.setupScreenWidth();
  }.property(),
  setupScreenWidth: function () {
    this.set('documentWidth', this.$().parent().innerWidth());
  },
  didInsertElement: function () {
    Ember.run.schedule("actions", () => this.setupScreenWidth());
    Ember.$(window).on('resize', this.get('onResizeWindow'));
  },
  willDestroyElement: function () {
    Ember.$(window).off('resize', this.get('onResizeWindow'));
  },
  width: 0,
  height: 0,
  left: function () {
    return this.get('model.x') - this.get('model.parentX') - this.get('width') / 2;
  }.property('model.x', 'width'),
  top: function () {
    return this.get('model.y') - this.get('model.parentY') - this.get('height');
  }.property('model.y', 'height'),
  onDidRender: function () {
    const element = this.get("element");
    const height = element.offsetHeight;
    const width = element.offsetWidth;
    const renderedData = this.get('renderedData');
    const data = this.get('model.data');
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
    const data = this.get('model.data');
    if (data == null) {
      this.set('renderedData', null);
    }
  }.observes('model.data'),
  properties: function () {
    const propertyMap = this.get('model.data.properties');
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
  }.property('model.data'),
  title: Ember.computed.alias('model.data.value'),
  isLink: function () {
    const data = this.get('model.data');
    if (data != null) {
      return data.isLink === true;
    } else {
      return null;
    }
  }.property('model.data')
});
