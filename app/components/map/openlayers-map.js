import Ember from "ember";
import BaseLayer from "./base-layer";
import ContainerMixin from "thymeflow-front/mixins/map/container";
import ol from "ol";

const {assert} = Ember;

export default BaseLayer.extend(ContainerMixin, {
  tagName: 'div',
  classNames: 'map',

  openlayersOptions: [
    'controls', 'interactions', 'keyboard', 'logo', 'mapRenderer:renderer', 'view',
    // experimental
    'pixelRatio', 'keyboardEventTarget', 'loadTilesWhileAnimating', 'loadTilesWhileInteracting'
  ],

  openlayersRequiredOptions: [],

  // Events this map can respond to.
  openlayersEvents: [
    'click', 'dblclick', 'moveend', 'pointerdrag', 'pointermove', 'postcompose', 'postrender', 'precompose', 'singleclick'
  ],

  openlayersProperties: [
    'view'
  ],

  // Since no parent container layer is controlling the rendering flow,
  // we need to implement render hooks and call `layerSetup` and `layerTeardown` ourselves.
  //
  // This is the only case where it happens, because this is a real DOM element,
  // and its rendering flow reverts back to Ember way.
  containerLayer: null,

  didInsertElement() {
    this._super(...arguments);
    this.layerSetup();
    this.get('_childLayers').invoke('layerSetup');
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('_childLayers').invoke('layerTeardown');
    this.get('_childLayers').clear();
    this.layerTeardown();
  },

  // By default all layers try to register in a container layer.
  // It is not the case of the map itself as it is the topmost container.
  registerWithParent() {
  },
  unregisterWithParent() {
  },

  createLayer() {
    let options = this.get('options');
    // set the target
    options.target = this.$('.map-container').get(0);

    return new ol.Map(options);
  },

  didCreateLayer() {
    //after base layer bound the events, we can now set the map's view
    assert('You must provide either valid `extent` or a `center` and a `zoom` value.',
      (this.get('extent') && (!this.get('center') && this.get('zoom') === undefined)) ||
      (!this.get('extent') && (this.get('center') && this.get('zoom') !== undefined))
    );
    let view = new ol.View();
    const extent = this.get('extent');
    if (extent != null) {
      view.fit(extent, this._layer.getSize());
    } else {
      view.setCenter(this.get('center'));
      view.setZoom(this.get('zoom'));
    }
    this._layer.setView(view);
  }
});