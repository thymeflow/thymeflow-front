import Ember from 'ember';
import YASQE from 'yasqe';

export default Ember.Component.extend({
  tagName: 'textarea',
  attributeBindings: ['required', 'autofocus', 'name'],

  options: {
    createShareLink: null,
    fullScreen: false
  },

  didInsertElement() {
    this._super(...arguments);

    this._yasqe = YASQE.fromTextArea(this.get('element'), this.get('options'));

    // Send a "valueUpdated" action when CodeMirror triggers a "change" event.
    this.setupCodeMirrorEventHandler('change', this, this.scheduleValueUpdatedAction);
  },

  didRender() {
    this._super(...arguments);

    this.updateCodeMirrorOptions();
    this.updateCodeMirrorValue();
  },

  isVisibleDidChange: Ember.observer('isVisible', function() {
    if (this._wasVisible === this.get('isVisible')) {
      return;
    }

    Ember.run.scheduleOnce('render', this, this.toggleVisibility);
  }),

  scheduleValueUpdatedAction(codeMirror, changeObj) {
    Ember.run.once(this, this.sendValueUpdatedAction, codeMirror.getValue(), codeMirror, changeObj);
  },

  setupCodeMirrorEventHandler(event, target, method) {
    const callback = Ember.run.bind(target, method);

    this._yasqe.on(event, callback);

    this.one('willDestroyElement', this, function() {
      this._yasqe.off(event, callback);
    });
  },

  sendValueUpdatedAction(...args) {
    this.sendAction('valueUpdated', ...args);
  },

  toggleVisibility() {
    const isVisible = this.get('isVisible');

    if (this._wasVisible === isVisible) {
      return;
    }

    this._wasVisible = isVisible;

    if (isVisible) {
      // Force a refresh when becoming visible, since CodeMirror won't render
      // itself onto a hidden element.
      this._yasqe.refresh();
    }
  },

  updateCodeMirrorOption(option, value) {
    if (this._yasqe.getOption(option) !== value) {
      this._yasqe.setOption(option, value);
    }
  },

  updateCodeMirrorOptions() {
    const options = this.get('options');

    if (options) {
      Object.keys(options).forEach(function(option) {
        this.updateCodeMirrorOption(option, options[option]);
      }, this);
    }
  },

  updateCodeMirrorValue() {
    const value = this.get('value');

    if (value !== this._yasqe.getValue()) {
      this._yasqe.setValue(value || '');
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    // Remove the editor and restore the original textarea.
    this._yasqe.toTextArea();

    delete this._yasqe;
  }
});