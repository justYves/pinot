import Ember from 'ember';

export default Ember.Component.extend({

  init() {
    this._super(...arguments);
    debugger;

    alert('init dimensions');
  },

  didUpdateAttrs() {
    this._super(...arguments);
    debugger;

    alert('didUpdateAttrs dimensions');
  },

  loading: '',
  loaded: '',
  failed: ''
});
