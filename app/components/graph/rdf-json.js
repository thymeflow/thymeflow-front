import Ember from "ember";
import d3 from "d3";
import RdfJsonMixin from "../mixins/rdf-json";

export default Ember.Component.extend(RdfJsonMixin, {
  classNames: ["graph-container"],
  onUpdateRdfJson: function () {
    this.cleanSVG();
    const viewSize = this.get('viewSize');
    const svg = d3.select(this.$(".svg-container").get(0))
      .append("svg");

    const group = svg
      .attr("class", "svg-content-responsive")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${viewSize} ${viewSize}`)
      .call(d3.behavior.zoom().on("zoom", () => {
        group.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        Ember.run(this, this.updateTooltip);
      }))
      .append("g");

    const resizeToScale = this.drawSVG(svg, group);
    resizeToScale([1, 0, 0, 1, 0, 0], 1);
  }.observes('rdfJson'),
  didInsertElement: function () {
    this.onUpdateRdfJson();
  },
  willDestroyElement: function () {
    this.cleanSVG();
  }
});
