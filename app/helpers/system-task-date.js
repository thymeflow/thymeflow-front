import Ember from 'ember';

export function systemTaskDate([date]) {
  return moment(date).format('MM/DD/YYYY - hh:mm:ss a'); // By default we use US format
}

export default Ember.Helper.helper(systemTaskDate);