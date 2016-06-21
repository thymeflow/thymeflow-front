import Ember from 'ember';

export default Ember.Component.extend( {
  didInsertElement: function () {
    let parent = this.$().parent();
    this.set( 'width', parent.width() );

    this.$( '.springy' ).springy( {
      graph: this.get( 'graph' )
    } );
  }
} );
