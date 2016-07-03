import Ember from "ember";

export default Ember.Mixin.create({
  scrollableElement: function () {
    return this.$();
  }.property(),
  bindScroll: function () {
    this.get('scrollableElement').bind('scroll', (event) => {
      Ember.run(this, this.onScroll, event);
    });
  }.on('didInsertElement'),
  unBindScroll: function () {
    this.get('scrollableElement').unbind('scroll');
  }.on('willDestroyElement'),
  onScroll: function (event) {
    this.set('scrollLeft', event.target.scrollLeft);
    event.preventDefault();
  },
  onScrollLeftDidChange: function () {
    this.get('scrollableElement').scrollLeft(this.get('scrollLeft'));
  }.observes('scrollLeft')
});