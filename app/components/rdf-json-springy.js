import Ember from "ember";
/* global Springy */

export default Ember.Component.extend({
  rdfToSpringyGraph: function (rdfJson) {
    let graph = new Springy.Graph();
    let nodes = new Map();

    function getNode(value) {
      value.label = value.value;
      if (!nodes.has(value)) {
        nodes.set(value, graph.newNode(value));
      }
      return nodes.get(value);
    }

    function createEdgesForSubjectPropertyValues(values, subjectNode, propertyData) {
      values.forEach(val => graph.newEdge(subjectNode, getNode(val), propertyData));
    }

    function createEdgesForSubject(subject) {
      let subjectNode = getNode({
        type: 'uri',
        value: subject
      });
      for (let property in rdfJson[subject]) {
        let propertyData = {
          type: 'uri',
          value: property
        };
        createEdgesForSubjectPropertyValues(rdfJson[subject][property], subjectNode, propertyData);
      }
    }

    for (let subject in rdfJson) {
      createEdgesForSubject(subject);
    }
    return graph;
  },
  onUpdateRdfJson: function () {
    let parent = this.$().parent();
    this.set('width', parent.width());
    this.$('.springy').springy({
      graph: this.rdfToSpringyGraph(this.get('rdfJson'))
    });
  }.observes('rdfJson'),
  didInsertElement: function () {
    this.onUpdateRdfJson();
  }
});
