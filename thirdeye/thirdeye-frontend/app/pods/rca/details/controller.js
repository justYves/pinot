import Ember from 'ember';

export default Ember.Controller.extend({
  granularity: null,
  granularities: Ember.computed.reads('model.granularities'),

  actions: {
    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    }
  }
});
