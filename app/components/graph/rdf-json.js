import Ember from "ember";
import d3 from "d3";
import RdfJsonMixin from "../mixins/rdf-json";

export default Ember.Component.extend(RdfJsonMixin, {
  classNames: ["graph-container"],
  onUpdateRdfJson: function () {
    this.cleanSVG();
    const svgContainer = d3.select(this.$(".graph-svg-container").get(0))
      .append("svg");

    const group = svgContainer
      .call(d3.behavior.zoom().on("zoom", () => {
        group.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        Ember.run(this, this.updateTooltip);
      }))
      .append("g");

    const resizeToScale = this.drawSVG(svgContainer, group);
    resizeToScale([1, 0, 0, 1, 0, 0], 1);
  }.observes('rdfJson'),
  didInsertElement: function () {
    this._super(...arguments);
    this.onUpdateRdfJson();
  },
  willDestroyElement: function () {
    this._super(...arguments);
    this.cleanSVG();
  }
});
