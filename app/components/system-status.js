import Ember from 'ember';

export default Ember.Component.extend({

  hasRunningTasks: Ember.computed('tasks.@each.endDate', function() {
    let tasks = this.get('tasks');

    if (!tasks || tasks.get('length') === 0) {
      return false;
    }

    return tasks.any(function(task) {

      let endDate = task.get('endDate');

      return endDate === null;
    });
  }),

  actions: {
    toggleSystemTasksBody() {
      this.toggleProperty('isShowingSystemTasksBody');
    },
    toggleSystemHistoryBody() {
      this.toggleProperty('isShowingSystemHistoryBody');
    }
  }
});
