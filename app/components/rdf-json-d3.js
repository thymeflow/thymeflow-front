import Ember from "ember";
import d3 from "d3";

const typeProperty = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export default Ember.Component.extend({
  tagName: "div",
  classNames: ["svg-container"],
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
      if (!node.properties.has(property)) {
        node.properties.set(property, []);
      }
      node.properties.get(property).push(literal);
    }

    function createEdgesForSubjectPropertyValues(subjectNode, property, targets) {
      if (property === typeProperty) {
        targets.forEach(target => addType(subjectNode, target.value));
      } else {
        const propertyData = getProperty(property);
        targets.forEach(target => {
          if (target.type === 'uri') {
            links.push({source: subjectNode, target: getNode(target.value), value: propertyData});
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
    this.cleanVisualization();

    const graph = this.rdfToGraph(this.get('rdfJson'));

    const tip = d3.tip().attr('class', 'graph-tooltip n').html(function (d) {
      const root = Ember.$("<div/>");
      root.append(Ember.$("<div/>").text(d.value));
      for (var [property, literals] of d.properties.entries()) {
        root.append(Ember.$("<div/>").text(`${property}: ${literals.map(literal => `"${literal.value}" (${literal.type})`)}`));
      }
      return root.html();
    });

    const tipLink = d3.tip().attr('class', 'graph-tooltip n').html(function (d) {
      return Ember.$("<div/>").text(d.value).html();
    });

    const nodeTypeColor = d3.scale.category20();
    const linkPropertyColor = d3.scale.category20();

    const force = d3.layout.force()
      .charge(-200)
      .linkDistance(100)
      .size([4000, 4000]);

    const svgBase = d3.select(this.$().get(0)).append("svg");

    const svg = svgBase.attr("class", "svg-content-responsive")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 4000 4000")
      .call(d3.behavior.zoom().on("zoom", function () {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
      }))
      .call(tip)
      .call(tipLink)
      .append("g");


    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    const link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "graph-link")
      .style("stroke", function (d) {
        return linkPropertyColor(d.value);
      })
      .on('mouseover', tipLink.show)
      .on('mouseout', tipLink.hide);

    const node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "graph-node")
      .attr("r", 6)
      .style("fill", function (d) {
        return nodeTypeColor(d.type);
      })
      .call(force.drag)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

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

      node.attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    });

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
