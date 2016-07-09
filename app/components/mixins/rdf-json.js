import Ember from "ember";
import d3 from "d3";
import ol from "ol";

const typeProperty = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const imageProperty = "http://schema.org/image";
const longitudeProperty = "http://schema.org/longitude";
const latitudeProperty = "http://schema.org/latitude";
const tooltipOffset = {x: 0, y: -10};
const defaultViewSize = 4000;
const imageSize = 50;

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

export default Ember.Mixin.create({
  tooltipElement: null,
  tooltipX: 0,
  tooltipY: 0,
  showTooltip: function (d) {
    var args = Array.prototype.slice.call(arguments);
    var targetElement = null;
    if (args[args.length - 1] instanceof SVGElement) {
      targetElement = args.pop();
    }
    targetElement = targetElement || d3.event.target;
    const svgElement = this.get('svg').node();
    // tooltip coordinates with respect to page
    let coords = null;
    if (d.isLink) {
      if (d3.event != null && (d3.event.type === "mouseover" || d3.event.type === "mousemove")) {
        coords = {
          top: d3.event.pageY,
          left: d3.event.pageX
        };
      }
    } else {
      // tooltip coordinates with respect to screen
      var bbox = getScreenCoordinates(targetElement, svgElement);
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
      coords = {
        top: bbox.north.y + scrollTop,
        left: bbox.north.x + scrollLeft
      };
    }
    if (coords != null) {
      const svgOffset = Ember.$(svgElement).offset();
      // tooltip coordinates relative to the parent element's position
      this.setProperties({
        tooltipX: tooltipOffset.x + coords.left - svgOffset.left,
        tooltipY: tooltipOffset.y + coords.top - svgOffset.top,
        tooltipData: d,
        tooltipElement: targetElement
      });
    }
  },
  updateTooltip: function () {
    const tooltipData = this.get('tooltipData');
    if (tooltipData != null) {
      this.showTooltip(tooltipData, this.get('tooltipElement'));
    }
  },
  hideTooltip: function () {
    this.setProperties({
      tooltipData: null,
      tooltipElement: null
    });
  },
  geographic: false,
  targetCrs: null,
  rdfJsonToGraph: function (rdfJson) {
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
      for (const property of Object.keys(rdfJson[subject])) {
        createEdgesForSubjectPropertyValues(subjectNode, property, rdfJson[subject][property]);
      }
    }

    for (const subject of Object.keys(rdfJson)) {
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
  viewSize: defaultViewSize,
  linkDistance: 300,
  observesLinkDistance: function () {
    const force = this.get('force');
    if (force != null) {
      force.stop();
      force.start();
    }
  }.observes('linkDistance'),
  charge: -200,
  gravity: 0.1,
  cleanSVG(){
    const svg = this.get('svg');
    const force = this.get('force');
    if (force != null) {
      force.stop();
    }
    if (svg != null) {
      svg.remove();
    }
    this.set('svg', null);
    this.set('force', null);
  },
  drawSVG(svg, g){
    this.set('svg', svg);
    const gravity = this.get('gravity');
    const viewSize = this.get('viewSize');
    const removePrefix = this.get('removePrefix');
    const graph = this.rdfJsonToGraph(this.get('rdfJson'));

    const nodeTypeColor = d3.scale.category20();
    const linkPropertyColor = d3.scale.category20();

    svg.on('click', deselectElement);

    const force = d3.layout.force()
      .charge(this.get('charge'))
      .size([viewSize, viewSize])
      .linkDistance(() => this.get('linkDistance'))
      .gravity(gravity);

    const prefixedLongitudeProperty = removePrefix(longitudeProperty);
    const prefixedLatitudeProperty = removePrefix(latitudeProperty);

    if (this.get('geographic')) {
      const crs = "EPSG:4326";
      const targetCrs = this.get('targetCrs');
      graph.nodes.forEach(function (node) {
        if (node.properties.has(prefixedLongitudeProperty) && node.properties.has(prefixedLatitudeProperty)) {
          let point = [Number(node.properties.get(prefixedLongitudeProperty)[0].value),
            Number(node.properties.get(prefixedLatitudeProperty)[0].value)];
          if (targetCrs !== crs) {
            point = ol.proj.transform(point, crs, targetCrs);
          }
          node.x = point[0];
          node.y = point[1];
          node.fixed = true;
        }
      });
    }

    force
      .nodes(graph.nodes)
      .links(graph.links);

    const self = this;

    const link = g.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "graph-link")
      .style("stroke", function (d) {
        return linkPropertyColor(d.value);
      })
      .on('click', clickElement)
      .on('mouseover', function () {
        self.showTooltip(...arguments);
      })
      .on('mousemove', function () {
        self.showTooltip(...arguments);
      })
      .on('mouseout', function () {
        self.hideTooltip(...arguments);
      });

    const node = g.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .call(force.drag)
      .on('click', clickElement)
      .on('mouseover', function () {
        self.showTooltip(...arguments);
      })
      .on('mouseout', function () {
        self.hideTooltip(...arguments);
      });

    const nodeCircle = node.append("circle")
      .attr("class", "graph-node")
      .style("fill", function (d) {
        return nodeTypeColor(d.type);
      });

    const prefixedImageProperty = removePrefix(imageProperty);

    const nodeImage = node.filter(function (d) {
      return d.properties.has(prefixedImageProperty);
    }).append("image")
      .attr("xlink:href", function (d) {
        if (d.properties.has(prefixedImageProperty)) {
          return d.properties.get(prefixedImageProperty)[0].value;
        } else {
          return "#";
        }
      });

    let coordinateTransformationMatrix = null;
    let hasTick = false;
    function positionElements() {
      // ensure force has already started before positioning elements
      if (hasTick) {
        if (coordinateTransformationMatrix != null) {
          link.attr("x1", function (d) {
              return coordinateTransformationMatrix[0] * d.source.x + coordinateTransformationMatrix[2] * d.source.y + coordinateTransformationMatrix[4];
            })
            .attr("y1", function (d) {
              return coordinateTransformationMatrix[1] * d.source.x + coordinateTransformationMatrix[3] * d.source.y + coordinateTransformationMatrix[5];
            })
            .attr("x2", function (d) {
              return coordinateTransformationMatrix[0] * d.target.x + coordinateTransformationMatrix[2] * d.target.y + coordinateTransformationMatrix[4];
            })
            .attr("y2", function (d) {
              return coordinateTransformationMatrix[1] * d.target.x + coordinateTransformationMatrix[3] * d.target.y + coordinateTransformationMatrix[5];
            });

          node.attr("transform", (d) => {
            return `translate(${coordinateTransformationMatrix[0] * d.x + coordinateTransformationMatrix[2] * d.y + coordinateTransformationMatrix[4]},${coordinateTransformationMatrix[1] * d.x + coordinateTransformationMatrix[3] * d.y + coordinateTransformationMatrix[5]})`;
          });
        }
      }

    }

    force.on("tick", function () {
      hasTick = true;
      positionElements();
      Ember.run(self, self.updateTooltip);
    });

    let scale = null;
    function resizeToScale(newCoordinateTransformationMatrix, elementScale) {
      if (newCoordinateTransformationMatrix != null && (coordinateTransformationMatrix == null || newCoordinateTransformationMatrix.some((v, index) => coordinateTransformationMatrix[index] !== v))) {
        coordinateTransformationMatrix = newCoordinateTransformationMatrix;
        positionElements();
      }
      if (scale !== elementScale) {
        scale = elementScale;
        link.style("stroke-width", 3 * scale);
        nodeCircle.attr("r", 6 * scale)
          .style("stroke-width", 1.5 * scale);
        nodeImage.attr("x", function () {
            return -imageSize * scale / 2;
          })
          .attr("y", function () {
            return -imageSize * scale / 2;
          })
          .attr("height", imageSize * scale)
          .attr("width", imageSize * scale);
      }
    }

    // build a neighbor map.
    const neighbors = new Map();
    graph.nodes.forEach(node => neighbors.set(node, new Set([node])));
    graph.links.forEach(function (d) {
      neighbors.get(d.source).add(d.target);
      neighbors.get(d.target).add(d.source);
    });

    let selectedElement = null;

    function deselectElement() {
      if (selectedElement != null) {
        node.style("opacity", 1);
        link.style("opacity", 1);
        selectedElement = null;
      }
    }

    function clickElement() {
      const d = d3.select(this).node().__data__;
      if (selectedElement === d) {
        // we have clicked on the previous selected node, unselect it
        node.style("opacity", 1);
        link.style("opacity", 1);
        selectedElement = null;
      } else {
        // Reduce the opacity of all but the neighbouring nodes
        selectedElement = d;
        if (d.isLink) {
          const highlightedNodes = new Set();
          graph.links.forEach(link => {
            if (link.value === selectedElement.value) {
              highlightedNodes.add(link.source);
              highlightedNodes.add(link.target);
            }
          });
          node.style("opacity", function (node) {
            return highlightedNodes.has(node) ? 1 : 0.1;
          });
          link.style("opacity", function (link) {
            return (link.value === selectedElement.value) ? 1 : 0.1;
          });
        } else {
          node.style("opacity", function (o) {
            return neighbors.get(d).has(o) ? 1 : 0.1;
          });
          link.style("opacity", function (o) {
            return d === o.source || d === o.target ? 1 : 0.1;
          });
        }
      }
      d3.event.stopPropagation();
    }

    force.start();
    this.set('force', force);
    return resizeToScale;
  }
});
