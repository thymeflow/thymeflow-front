import Ember from 'ember';
import ENV from 'thymeflow-front/config/environment';

export default Ember.Service.extend({
  tasks: null,
  serverStatus: 'connecting',
  store: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.startPollingTasks();
  },
  logNextError: true,
  updateTasks() {
    let tasks = this.get('tasks');
    if (tasks != null){
      tasks.update().then(
        () => this.set('serverStatus', 'ok'),
        () => this.set('serverStatus', 'unreachable')
      );
    } else {
      this.get('store').findAll('system-task').then(
        tasks =>{
          this.set('serverStatus', 'ok');
          this.set('tasks', tasks);
        },
        error => {
          this.set('serverStatus', 'unreachable');
          if(this.get('logNextError')){
            console.log(error);
            this.set('logNextError', false);
          }
        }
      );
    }
  },

  startPollingTasks: function(){
    if(this.get('tasksTimer') == null){
      this.pollTasks();
    }
  },
  startTasksTimer(){
    let timer = Ember.run.later(this, this.pollTasks, ENV.APP.systemTasksPollingInterval);
    this.set('tasksTimer', timer);
  },
  pollTasks() {
    this.startTasksTimer();
    this.updateTasks();
  }
});