import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  keyForAttribute: function(attr) {
    return attr;
  },
  keyForRelationship(key) {
    return key;
  },
  normalizeResponse(store, primaryModelClass, payload) {

    for (let i = 0; i < payload.data.length; i++) {
      let task = payload.data[i];
      if (!task.attributes.progress) {
        task.attributes.progress = null;
      }
      if (!task.attributes.endDate) {
        task.attributes.endDate = null;
      }
    }

    return this._super(...arguments);
  }
});
