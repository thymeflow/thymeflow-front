import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'tr',
  isCompleted: Ember.computed('task.endDate', function() {
    let task = this.get('task');
    let endDate = task.get('endDate');

    return endDate !== null;
  })
});
