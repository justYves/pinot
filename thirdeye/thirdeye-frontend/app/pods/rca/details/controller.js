import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['granularity', 'filter'],
  granularities: Ember.computed.reads('model.granularities'),
  // granularity: Ember.computed.reads('granularities.firstObject'),
  noMatchesMessage: '',
  filters: JSON.stringify({}),
  metricFilters: Ember.computed.reads('model.metricFilters'),

  actions: {
    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    }
  }
});
