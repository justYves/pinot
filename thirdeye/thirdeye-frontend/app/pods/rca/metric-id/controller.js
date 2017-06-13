import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import moment from 'moment';


export default Ember.Controller.extend({
  primaryMetric: Ember.computed.reads('model.primaryMetric'),
  granularities: Ember.computed.reads('model.granularities'),

  selecteGranularity: Ember.computed.reads('granularities.firstObject'),



  filters: Ember.computed.reads('model.filters'),
  maxTime: Ember.computed.reads('model.maxTime'),

  endDate: Ember.computed(function() {
    return moment().subtract('1', 'days').endOf('days');
  }),
  startDate: Ember.computed('endDate', function() {
    return this.get('endDate').clone().subtract('1', 'weeks');
  }),

  // uiStartDate: 
  // uiEndDate:  Ember.computed(function() {
  //   return moment().subtract('1', 'days').endOf('days').format('MM/DD/YYYY');
  // }),

  searchMetrics: task(function* (metric) {
    yield timeout(600);
    let url = `/data/autocomplete/metric?name=${metric}`;
    return fetch(url)
      .then(res => res.json()) 
  }),

  actions: {
    onMetricChange(metric) {
      this.transitionToRoute('rca.metric-id', metric.id);
    },
    onGranularityChange(granularity) {
      this.set('selecteGranularity', granularity);
    },
  }
});
