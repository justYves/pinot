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

    setNewDate({ start, end }) {
      alert('yo' + start + '' + end);

      const analysisStart = moment(start).valueOf();
      const analysisEnd = moment(end).valueOf();
      const {
          startDate: currentStart,
          endDate: currentEnd
        } = this.getProperties('startDate', 'endDate');

      this.setProperties({
        analysisStart,
        analysisEnd
      });

      if (analysisStart < currentStart) {
        const newStartDate = +currentStart - (currentEnd - currentStart);
        this.set('startDate', newStartDate);
      }
    },

    setDateParams([start, end]) {
      Ember.run.debounce(this, this.get('actions.setNewDate'), { start, end }, 1000);
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
