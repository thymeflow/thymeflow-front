import Ember from 'ember';

let systemTasks = [{
  type: 'import',
  name: 'Import Service google 2',
  startDate: '2015-10-25T12:25:25.782Z',
  progress: 100,
  status: 'Done'
}, {
  type: 'import',
  name: 'Import file',
  startDate: '2015-10-25T12:25:25.782Z',
  progress: 50,
  status: 'In progress'
}, {
  type: 'import',
  name: 'Import Service google',
  startDate: '2015-10-25T12:25:25.782Z',
  progress: null,
  status: 'In progress'
}, {
  type: 'import',
  name: 'Import Service google',
  startDate: '2015-10-25T12:25:25.782Z',
  progress: 0,
  status: 'Waiting'
}];

export default Ember.Route.extend({
  model() {
    return systemTasks;
  }
});