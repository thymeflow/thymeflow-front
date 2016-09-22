import Ember from 'ember';

export default Ember.Component.extend({

  hasRunningTasks: Ember.computed('tasks.@each.progress', function() {
    let tasks = this.get('tasks');

    if (!tasks || tasks.get('length') === 0) {
      return false;
    }

    return tasks.any(function(item) {

      let progress = item.get('progress');

      return !progress || (progress && progress !== 100);
    });
  }),

  actions: {
    toggleSystemTasksBody() {
      this.toggleProperty('isShowingSystemTasksBody');
    }
  }
});