import Ember from 'ember';

export default Ember.Component.extend({
  systemStatus: Ember.inject.service(),
  serverStatus: Ember.computed.alias('systemStatus.serverStatus'),
  tasks: Ember.computed.alias('systemStatus.tasks'),
  activityIcon: function(){
    const serverStatus = this.get('serverStatus');
    switch(serverStatus){
      case 'ok':
        return (this.get('hasRunningTasks')) ? 'fa-cog fa-spin fa-fw' : 'fa-check';
      case 'connecting':
        return 'fa-spinner fa-spin fa-fw';
      case 'unreachable':
        return 'fa-plug';
      default:
        return 'fa-question';
    }
  }.property('serverStatus'),
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
    },
    openQuery(query){
      this.sendAction('openQuery', query);
    }
  }
});
