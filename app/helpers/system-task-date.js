import Ember from 'ember';

export function systemTaskDate([date]) {
  return moment(date).format('L - LTS');
}

export default Ember.Helper.helper(systemTaskDate);