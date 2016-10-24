import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['sparql-history-container'],
  sparqlHistory: Ember.inject.service(),

  gridOptions: Ember.computed('sparqlHistory.items', function() {

    let model = this.get('sparqlHistory').get('items');

    let columnDefs = [
      { headerName: "Product", field: "name" },
      { headerName: 'Units', field: 'units' },
      { headerName: 'Sales', field: 'sales' },
      { headerName: 'Profit', field: 'profit' }
    ];

    let gridOptions = {
      columnDefs: columnDefs,
      rowData: model,
      rowHeight: 40,
      enableSorting: true,
      enableColResize: true,
      suppressCellSelection: true, //remove option to click on cell
    };

    return gridOptions;
  })
});
