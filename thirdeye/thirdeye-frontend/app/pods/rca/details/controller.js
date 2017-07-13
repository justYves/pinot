import Ember from 'ember';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';

export default Ember.Controller.extend({
  queryParams: [
    'granularity',
    'filters',
    'compareMode',
    'startDate',
    'endDate',
    'analysisStart',
    'analysisEnd'
  ],
  granularities: Ember.computed.reads('model.granularities'),
  // granularity: Ember.computed.reads('granularities.firstObject'),
  noMatchesMessage: '',
  filters: JSON.stringify({}),

  compareMode: null,
  compareModeOptions: ['WoW', 'Wo2W', 'Wo3W', 'Wo4W'],
  mostRecentTask: null,
  metricFilters: Ember.computed.reads('model.metricFilters'),

  actions: {
    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    },

    setDateParams([start, end]) {
      const startDate = moment(start).valueOf();
      const endDate = moment(end).valueOf();

      this.setProperties({
        analysisStart: startDate,
        analysisEnd: endDate
      });
      return [start, end];
    },

    /**
     * Changes the compare mode
     * @param {String} compareMode baseline compare mode
     */
    onModeChange(compareMode){
      this.set('compareMode', compareMode);
    }
  }
});
