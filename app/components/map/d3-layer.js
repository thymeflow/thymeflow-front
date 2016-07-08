import Ember from "ember";
import ChildMixin from "thymeflow-front/mixins/map/child";
import d3 from "d3";
import RdfJsonMixin from "../mixins/rdf-json";

const {Component} = Ember;

export default Component.extend(RdfJsonMixin, ChildMixin, {
  tagName: "",
  geographic: true,
  linkDistance: 2000,
  gravity: 0,
  _matrix(matrix){
    const a = matrix[0];
    const c = matrix[4];
    const e = matrix[12];
    const b = matrix[1];
    const d = matrix[5];
    const f = matrix[13];
    return [a, b, c, d, e, f];
  },
  createLayer() {
    const openlayersMap = this.get('containerLayer._layer');
    const element = this.get("containerLayer.element");
    const svg = d3.select(element)
      .select('div.ol-viewport')
      .insert("svg", "canvas.ol-unselectable")
      .attr('style', 'position: absolute')
      .attr('width', "100%").attr('height', "100%");

    this.set('svgContainerElement', svg.node());
    const g = svg.append("g");
    const targetCrs = this.get('containerLayer.crs');
    this.set('targetCrs', targetCrs);

    const resizeToScale = this.drawSVG(svg, g);
    const postComposeHandler = () => {
      const coordinateToPixelMatrix = this._matrix(openlayersMap.frameState_.coordinateToPixelMatrix);
      // try to keep SVG translations between 0 and 100000, because SVG rendering does not work well when
      // transforms with high translate values are provided. 
      const translateStep = 100000;
      const translateX = Math.floor(coordinateToPixelMatrix[4] / translateStep) * translateStep;
      const translateY = Math.floor(coordinateToPixelMatrix[5] / translateStep) * translateStep;
      coordinateToPixelMatrix[4] = (coordinateToPixelMatrix[4] - translateX);
      coordinateToPixelMatrix[5] = (coordinateToPixelMatrix[5] - translateY);
      // move the whole SVG coordinateToPixelMatrix
      g.attr("transform", `translate(${coordinateToPixelMatrix[4]}, ${coordinateToPixelMatrix[5]})`);
      coordinateToPixelMatrix[4] = translateX;
      coordinateToPixelMatrix[5] = translateY;
      resizeToScale(coordinateToPixelMatrix, 1);
    };
    openlayersMap.on('postcompose', postComposeHandler);
    this.set('postComposeHandler', postComposeHandler);
    return svg;
  },

  didCreateLayer: Ember.K,
  willDestroyLayer: Ember.K,

  /*
   * Method called by parent when the layer needs to setup
   */
  layerSetup() {
    this._layer = this.createLayer();
    this.didCreateLayer();
  },

  /*
   * Method called by parent when the layer needs to teardown
   */
  layerTeardown() {
    this.willDestroyLayer();
    if (this.get('containerLayer') && this._layer) {
      const openlayersMap = this.get('containerLayer._layer');
      const postComposeHandler = this.get('postComposeHandler');
      openlayersMap.un('postcompose', postComposeHandler);
      this.cleanSVG();
    }
    this._layer = null;
  }
});