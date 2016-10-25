import Ember from 'ember';

export default Ember.Route.extend({
  contacts: Ember.inject.service(),
  model(){
    return this.get('contacts').get('all');
  }
});
