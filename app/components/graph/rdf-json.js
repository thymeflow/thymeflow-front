import Ember from "ember";
import d3 from "d3";

const typeProperty = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const imageProperty = "http://schema.org/image";
const nodeTypeColor = d3.scale.category20();
const linkPropertyColor = d3.scale.category20();
const tooltipOffset = {x: 0, y: -10};

function getScreenCoordinates(targetElement, svg) {
  while ('undefined' === typeof targetElement.getScreenCTM && 'undefined' === targetElement.parentNode) {
    targetElement = targetElement.parentNode;
  }

  const bbox = {},
    matrix = targetElement.getScreenCTM(),
    targetElementBBox = targetElement.getBBox(),
    width = targetElementBBox.width,
    height = targetElementBBox.height,
    x = targetElementBBox.x,
    y = targetElementBBox.y,
    point = svg.createSVGPoint();

  point.x = x + width / 2;
  point.y = y;

  bbox.north = point.matrixTransform(matrix);

  point.y += height / 2;
  bbox.center = point.matrixTransform(matrix);

  return bbox;
}

export default Ember.Component.extend({
  classNames: ["graph-container"],
  tooltipElement: null,
  tooltipVisible: false,
  tooltipX: 0,
  tooltipY: 0,
  showTooltip: function (d) {
    var args = Array.prototype.slice.call(arguments);
    var targetElement = null;
    if (args[args.length - 1] instanceof SVGElement) {
      targetElement = args.pop();
    }
    targetElement = targetElement || d3.event.target;
    const $svg = this.$('svg');
    var bbox = getScreenCoordinates(targetElement, $svg.get(0));
    // tooltip coordinates with respect to screen
    var coords = null;
    if (d.isLink) {
      coords = {
        top: bbox.center.y,
        left: bbox.center.x
      };
    } else {
      coords = {
        top: bbox.north.y,
        left: bbox.north.x
      };
    }
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
      scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    const svgOffset = $svg.offset();
    // tooltip coordinates with relative to the parent's position
    this.set('tooltipY', tooltipOffset.y + coords.top + scrollTop - svgOffset.top);
    this.set('tooltipX', tooltipOffset.x + coords.left + scrollLeft - svgOffset.left);
    this.set('tooltipData', d);
    this.set('tooltipElement', targetElement);
    this.set('tooltipVisible', true);
  },
  updateTooltip: function () {
    if (this.get('tooltipVisible')) {
      this.showTooltip(this.get('tooltipData'), this.get('tooltipElement'));
    }
  },
  hideTooltip: function () {
    this.set('tooltipVisible', false);
  },
  rdfToGraph: function (rdfJson) {
    const removePrefix = this.get('removePrefix');
    const nodes = new Map();
    const links = [];

    function getNode(nodeValue) {
      const nodeId = nodeValue;
      if (!nodes.has(nodeId)) {
        nodes.set(nodeId, {value: removePrefix(nodeValue), types: [], properties: new Map()});
      }
      return nodes.get(nodeId);
    }

    function addType(node, type) {
      node.types.push(type);
    }

    function getProperty(propertyValue) {
      return removePrefix(propertyValue);
    }

    function setNodeProperty(node, property, literal) {
      const unprefixedProperty = removePrefix(property);
      if (!node.properties.has(unprefixedProperty)) {
        node.properties.set(unprefixedProperty, []);
      }
      node.properties.get(unprefixedProperty).push(literal);
    }

    function createEdgesForSubjectPropertyValues(subjectNode, property, targets) {
      if (property === typeProperty) {
        targets.forEach(target => addType(subjectNode, target.value));
      } else {
        const propertyData = getProperty(property);
        targets.forEach(target => {
          if (target.type === 'uri') {
            links.push({isLink: true, source: subjectNode, target: getNode(target.value), value: propertyData});
          } else {
            setNodeProperty(subjectNode, property, target);
          }
        });
      }
    }

    function createEdgesForSubject(subject) {
      let subjectNode = getNode(subject);
      for (let property in rdfJson[subject]) {
        createEdgesForSubjectPropertyValues(subjectNode, property, rdfJson[subject][property]);
      }
    }

    for (let subject in rdfJson) {
      createEdgesForSubject(subject);
    }

    const nodeArray = Array.from(nodes.values());
    const typeMap = new Map();
    var typeCount = 0;
    nodeArray.forEach(node => {
      node.types = node.types.sort();
      const id = JSON.stringify(node.types);
      if (!typeMap.has(id)) {
        typeCount += 1;
        typeMap.set(id, typeCount);
      }
      node.type = typeMap.get(id);
    });

    return {links: links, nodes: nodeArray};
  },
  cleanVisualization: function () {
    const node = this.get('node');
    const link = this.get('link');
    const svg = this.get('svg');
    const force = this.get('force');
    if (force != null) {
      force.stop();
    }
    if (node != null) {
      node.remove();
    }
    if (link != null) {
      link.remove();
    }
    if (svg != null) {
      svg.remove();
    }
  },
  onUpdateRdfJson: function () {
    const viewSize = 4000;
    const imageSize = 50;
    this.cleanVisualization();
    const removePrefix = this.get('removePrefix');
    const graph = this.rdfToGraph(this.get('rdfJson'));

    const force = d3.layout.force()
      .charge(-200)
      .linkDistance(300)
      .size([viewSize, viewSize]);

    function onTransform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }

    const svgBase = d3.select(this.$(".svg-container").get(0)).append("svg");

    const svg = svgBase.attr("class", "svg-content-responsive")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${viewSize} ${viewSize}`)
      .call(d3.behavior.zoom().on("zoom", () => {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        Ember.run(this, this.updateTooltip);
      })).on('click', deselectNode)
      .append("g");

    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();
    const self = this;

    const link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "graph-link")
      .style("stroke", function (d) {
        return linkPropertyColor(d.value);
      })
      .on('mouseover', function () {
        self.showTooltip(...arguments);
      })
      .on('mouseout', function () {
        self.hideTooltip(...arguments);
      });

    const node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .call(force.drag)
      .on('click', connectedNodes)
      .on('mouseover', function () {
        self.showTooltip(...arguments);
      })
      .on('mouseout', function () {
        self.hideTooltip(...arguments);
      });

    node.append("circle")
      .attr("class", "graph-node")
      .attr("r", 6)
      .style("fill", function (d) {
        return nodeTypeColor(d.type);
      });

    const unprefixedImageProperty = removePrefix(imageProperty);
    
    node.filter(function (d) {
      return d.properties.has(unprefixedImageProperty);
    }).append("image")
      .attr("xlink:href", function (d) {
        if (d.properties.has(unprefixedImageProperty)) {
          return d.properties.get(unprefixedImageProperty)[0].value;
        } else {
          return "#";
        }
      })
      .attr("x", function () {
        return -imageSize / 2;
      })
      .attr("y", function () {
        return -imageSize / 2;
      })
      .attr("height", imageSize)
      .attr("width", imageSize);

    force.on("tick", function () {
      link.attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node.attr("transform", onTransform);
      Ember.run(self, self.updateTooltip);
    });

    //Toggle stores whether the highlighting is on
    var toggle = 0;
    var neighbors = new Map();
    graph.nodes.forEach(node => neighbors.set(node.value, new Set([node.value])));
    graph.links.forEach(function (d) {
      neighbors.get(d.source.value).add(d.target.value);
      neighbors.get(d.target.value).add(d.source.value);
    });
    var selectedNode = null;

    function deselectNode() {
      if (selectedNode != null) {
        node.style("opacity", 1);
        link.style("opacity", 1);
        selectedNode = null;
      }
      console.log(toggle);
    }
    function connectedNodes() {
      const d = d3.select(this).node().__data__;
      if (selectedNode === d) {
        // we have clicked on the previous selected node, unselect it
        node.style("opacity", 1);
        link.style("opacity", 1);
        selectedNode = null;
      } else {
        // Reduce the opacity of all but the neighbouring nodes
        selectedNode = d;
        node.style("opacity", function (o) {
          return neighbors.get(d.value).has(o.value) ? 1 : 0.1;
        });
        link.style("opacity", function (o) {
          return d.value === o.source.value || d.value === o.target.value ? 1 : 0.1;
        });
        d3.event.stopPropagation();
      }
    }

    this.set('node', node);
    this.set('link', link);
    this.set('svg', svgBase);
    this.set('force', force);
  }.observes('rdfJson'),
  didInsertElement: function () {
    this.onUpdateRdfJson();
  },
  willDestroyElement: function () {
    this.cleanVisualization();
  }
});
