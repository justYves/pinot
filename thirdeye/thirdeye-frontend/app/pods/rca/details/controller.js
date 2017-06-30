import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['granularity', 'filter', 'compareMode'],
  granularities: Ember.computed.reads('model.granularities'),
  // granularity: Ember.computed.reads('granularities.firstObject'),
  noMatchesMessage: '',
  filters: JSON.stringify({}),

  compareMode: 'WoW',
  compareModeOptions: ['WoW', 'Wo2W', 'Wo3W', 'Wo4W'],

  metricFilters: Ember.computed.reads('model.metricFilters'),

  actions: {
    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    },
    /**
     * Changes the compare mode
     * @param {String} compareMode baseline compare mode
     */
    onModeChange(compareMode){
      this.set('compareMode', compareMode);
    },
  }
});
