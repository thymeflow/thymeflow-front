import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {

    let modelId = 'http://thymeflow.com/personal#Service/'+ params.dataService_id;
    let model = this.get('store').peekRecord('data-service', modelId);

    if (model)
    {
      return model;
    }

    // TODO: implement endpoint in thymeflow-back
    //return this.get('store').find('data-service', modelId);

    this.transitionTo('data-services');
  }
});
