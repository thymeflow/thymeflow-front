import Ember from 'ember';

export default Ember.Service.extend({
  items: null,

  init() {
    this._super(...arguments);
    this.set('items', [
      {
        name: 'Chips',
        units: '223',
        sales: '$54,335',
        profit: '$545,454'
      },
      {
        name: 'Towels',
        units: '965',
        sales: '$1,900',
        profit: '$800'
      }]);
  },
  add(item) {
    this.get('items').pushObject(item);
  },
  getAll() {
    return this.get('items');
  },
  clear: function() {
    this.get('items').clear();
  }
});
