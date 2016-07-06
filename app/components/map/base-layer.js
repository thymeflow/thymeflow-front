import Ember from "ember";
import ChildMixin from "thymeflow-front/mixins/map/child";
import {InvokeActionMixin} from "ember-invoke-action";
import ol from "ol";

const {assert, computed, Component, run} = Ember;

export default Component.extend(ChildMixin, InvokeActionMixin, {
  crs: 'EPSG:3857',

  tagName: '',

  concatenatedProperties: ['openlayersOptions', 'openlayersRequiredOptions', 'openlayersEvents', 'openlayersProperties'],

  createLayer() {
    assert('BaseLayer\'s `createLayer` should be overriden.');
  },

  didCreateLayer: Ember.K,
  willDestroyLayer: Ember.K,

  /*
   * Method called by parent when the layer needs to setup
   */
  layerSetup() {
    this._layer = this.createLayer();
    this._addObservers();
    this._addEventListeners();
    const containerLayer = this.get('containerLayer');
    if (containerLayer) {
      if (this._layer instanceof ol.layer.Layer) {
        containerLayer._layer.addLayer(this._layer);
      } else if (this._layer instanceof ol.Overlay) {
        if (typeof(containerLayer._layer.addOverlay) === 'function') {
          containerLayer._layer.addOverlay(this._layer);
        } else {
          assert('Child layer is an Overlay and ContainerLayer cannot contain Overlays.');
        }
      } else {
        assert('Child layer is not a proper ol.layer.Layer or ol.Overlay.');
      }
    }
    this.didCreateLayer();
  },

  /*
   * Method called by parent when the layer needs to teardown
   */
  layerTeardown() {
    this.willDestroyLayer();
    this._removeEventListeners();
    this._removeObservers();
    if (this.get('containerLayer') && this._layer) {
      this.get('containerLayer')._layer.removeLayer(this._layer);
    }
    this._layer = null;
  },

  openlayersOptions: [],
  openlayersRequiredOptions: [],
  options: computed(function () {
    let openlayersOptions = this.get('openlayersOptions');
    let openlayersRequiredOptions = this.get('openlayersRequiredOptions');
    let options = {};
    const setOption = (optionName) => {
      let [property, openlayersProperty] = optionName.split(':');
      if (!openlayersProperty) {
        openlayersProperty = property;
      }
      if (this.get(property) !== undefined) {
        options[openlayersProperty] = this.get(optionName);
      }
    };
    openlayersOptions.forEach(setOption);
    openlayersRequiredOptions.forEach(optionName => {
      assert(`\`${optionName}\` is a required option but its value was \`${this.get(optionName)}\``, this.get(optionName));
      setOption(optionName);
    });
    return options;
  }),

  openlayersEvents: Ember.A(),
  usedOpenlayersEvents: computed('openlayersEvents', function () {
    return this.get('openlayersEvents').filter(eventName => {
      let methodName = '_' + eventName;
      let actionName = 'on' + Ember.String.classify(eventName);
      return this.get(methodName) !== undefined || this.get(actionName) !== undefined;
    });
  }),

  _addEventListeners() {
    this._eventHandlers = {};
    this.get('usedOpenlayersEvents').forEach(eventName => {

      let actionName = 'on' + Ember.String.classify(eventName);
      let methodName = '_' + eventName;
      // create an event handler that runs the function inside an event loop.
      this._eventHandlers[eventName] = function (e) {
        run.schedule('actions', this, function () {
          //try to invoke/send an action for this event
          this.invokeAction(actionName, e);
          //allow classes to add custom logic on events as well
          if (typeof this[methodName] === 'function') {
            Ember.run(this, this[methodName], e);
          }
        });
      };

      this._layer.addEventListener(eventName, this._eventHandlers[eventName], this);
    });
  },

  _removeEventListeners() {
    if (this._eventHandlers) {
      this.get('usedOpenlayersEvents').forEach(eventName => {
        this._layer.removeEventListener(eventName,
          this._eventHandlers[eventName], this);
        delete this._eventHandlers[eventName];
      });
    }
  },

  openlayersProperties: [],

  _addObservers() {
    this._observers = {};
    this.get('openlayersProperties').forEach(propExp => {

      let [property, openlayersProperty, ...params] = propExp.split(':');
      if (!openlayersProperty) {
        openlayersProperty = 'set' + Ember.String.classify(property);
      }
      let objectProperty = property.replace(/\.\[]/, ''); //allow usage of .[] to observe array changes

      this._observers[property] = function () {
        let value = this.get(objectProperty);
        assert(this.constructor + ' must have a ' + openlayersProperty + ' function.', !!this._layer[openlayersProperty]);
        let propertyParams = params.map(p => this.get(p));
        this._layer[openlayersProperty].call(this._layer, value, ...propertyParams);
      };

      this.addObserver(property, this, this._observers[property]);
    });
  },

  _removeObservers() {
    if (this._observers) {
      this.get('openlayersProperties').forEach(propExp => {

        let [property] = propExp.split(':');

        this.removeObserver(property, this, this._observers[property]);
        delete this._observers[property];
      });
    }
  }

});