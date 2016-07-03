import Ember from "ember";
import ScrollableContainer from "./mixins/scrollable-container";

export default Ember.Component.extend(ScrollableContainer, {
  attributeBindings: ["style"],
  classNames: 'sparql-result-table-body',
  scrollableElement: function () {
    return this.$().children().children();
  }.property()
});