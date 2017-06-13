import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import moment from 'moment';


export default Ember.Controller.extend({
  queryParams: [
    'granularity', 
    'metricId',
    'startDate',
    'endDate',
  ],
  metricId: null,
  filters: null,
  granularity: null,

  primaryMetric: Ember.computed.reads('model.primaryMetric'),
  granularities: Ember.computed.reads('model.granularities'),
  dimensions: Ember.computed.reads('model.dimensions'),
  maxTime: Ember.computed.reads('model.maxTime'),

  /**
   * Takes the filters and massage them for the power-select grouping api
   * Currently not showing the whole list because of performance issues
   */
  filterOptions: Ember.computed('model.metricfilters', function() {
    const filters = this.get('model.metricfilters');
    return Object.keys(filters).map((filterName, index) => {

      const filterOptions = filters[filterName]
        .filter(value => !!value)
        .map(value => `${filterName}::${value}`)

      const options = index
        ? [filterOptions[0]]
        : filterOptions;

      return {
        groupName: filterName,
        options
      }
    })
  }),

  /**
   * Default Current Range Start Date
   */
  startDate: Ember.computed('endDate', function() {
    const endDate = moment(this.get('endDate'));
    return endDate.clone().subtract('1', 'weeks');
    // return endDate.clone().subtract('1', 'weeks').valueOf();
  }),

  /**
   * Default Current Range End Date
   */
  endDate: Ember.computed(function() {
    return moment().subtract('1', 'days').endOf('days');
    // return moment().subtract('1', 'days').endOf('days').valueOf();
  }),

  // /**
  //  * Start Date in ms for query params
  //  */
  // startDateQuery: Ember.computed('startDate', function() {
  //   debugger;
  //   return this.get('startDate').valueOf();
  // }),

  // /**
  //  * End Date in ms for query params
  //  */
  // endDateQuery: Ember.computed('endDate', function() {
  //   return this.get('endDate').valueOf();
  // }),

  searchMetrics: task(function* (metric) {
    yield timeout(600);
    let url = `/data/autocomplete/metric?name=${metric}`;
    return fetch(url)
      .then(res => res.json()) 
  }),

  actions: {
    onMetricChange(metric) {
      this.set('metricId', metric.id);
      this.set('primaryMetric', metric);
    },

    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    },

    onFilterSelection(filters) {
      debugger;
      filters = filters || null;
      this.set('filters', filters)
    },

    onfilterSearch(filter) {
      // ToDo: implement filter Search
      // this.set('selectedFilter', filter);
    },

    onApply() {
      alert('working!');
      // dispatch an action here
    }
  }
});
