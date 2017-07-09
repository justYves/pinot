import Ember from 'ember';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';

export default Ember.Controller.extend({
  queryParams: [
    'granularity',
    'filter',
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

  compareMode: 'WoW',
  compareModeOptions: ['WoW', 'Wo2W', 'Wo3W', 'Wo4W'],

  metricFilters: Ember.computed.reads('model.metricFilters'),

  onDateChange: task(function* ([start, end]) {
    yield timeout(1000);
    const {
      startDate: currentStart,
      endDate: currentEnd
      } = this.getProperties('startDate', 'endDate');

    let startDate = moment(start);
    let endDate = moment(end);

    const shouldUpdateStart = startDate.isBefore(currentStart);
    const shouldUpdateEnd = endDate.isAfter(currentEnd);

    this.setProperties({
      analysisStart: startDate,
      analysisEnd: endDate
    });

    if (shouldUpdateStart && !shouldUpdateEnd) {
      const newStartDate = currentStart - (currentEnd - currentStart) ;
      this.set('startDate', newStartDate);
    }
  }).drop(),
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