import Ember from "ember";

export default Ember.Controller.extend({
  filter: '',
  filterText: '',
  filteredContacts: function() {
    const filter = this.get('filterText').toLowerCase();
    if(filter.length > 2){
      const filters = filter.split(' ');
      const filtered = this.get('model').filter(function(item) {
        const name = item.name || "";
        const email = item.email || "";
        return filters.every(singleFilter => {
          return (name.toLowerCase().indexOf(singleFilter) !== -1) || (email.toLowerCase().indexOf(singleFilter) !== -1);
        });
      });
      return filtered.sortBy("sortField");
    }else{
      return Ember.A();
    }
  }.property('filter'),
  onFilterTextChange: function() {
    // wait 1 second before applying the filter
    Ember.run.debounce(this, this.applyFilter, 1000);
  }.observes('filterText'),
  applyFilter: function() {
    this.set('filter', this.get('filterText'));
  }
});
