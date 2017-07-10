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

  compareMode: 'WoW',
  compareModeOptions: ['WoW', 'Wo2W', 'Wo3W', 'Wo4W'],
  mostRecentTask: null,

  metricFilters: Ember.computed.reads('model.metricFilters'),

  dateChangeTask: task(function* ([start, end]) {
    yield timeout(1000);
    const {
      startDate: currentStart,
      endDate: currentEnd
      } = this.getProperties('startDate', 'endDate');

    let startDate = moment(start);
    let endDate = moment(end);

    const shouldUpdateStart = startDate.isBefore(moment(Number(currentStart)));
    const shouldUpdateEnd = endDate.isAfter(moment(Number(currentEnd)));

    this.setProperties({
      analysisStart: startDate,
      analysisEnd: endDate
    });

    if (shouldUpdateStart && !shouldUpdateEnd) {
      const newStartDate = currentStart - (currentEnd - currentStart) ;
      this.set('startDate', newStartDate);
    }
  }),

  actions: {
    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    },

    onDateChange(date) {
      const mostRecentTask = this.get('mostRecentTask');
      mostRecentTask && mostRecentTask.cancel();

      const task = this.get('dateChangeTask');
      const taskInstance = task.perform(date);
      this.set('mostRecentTask', taskInstance);
      // alert(date);
      return date;
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
