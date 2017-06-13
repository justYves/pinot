import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import moment from 'moment';


export default Ember.Controller.extend({
  queryParams: ['metricId'],
  metricId: null,
  selectedFilter: null,
  filters: [],

  primaryMetric: Ember.computed.reads('model.primaryMetric'),
  granularities: Ember.computed.reads('model.granularities'),
  filterGroups: Ember.computed('model.filters', function() {
    return Object.keys(this.get('model.filters'));
  }),


  selecteGranularity: Ember.computed.reads('granularities.firstObject'),

  filterOptions: Ember.computed('model.filters', function() {
    // debugger;
    const filters = this.get('model.filters');
    return Object.keys(filters).map((filterName) => {
      const children = filters[filterName].map((child) => {
        return { 
          id: `${filterName}::${child}`,
          text: child
        }
      });
      return {
        text: filterName, 
        children
      }
    })
  }),

  // filterOptions: [
  //   { groupName: "Smalls", options: ["one", "two", "three"] },
  //   { groupName: "Mediums", options: ["four", "five", "six"] },
  //   { groupName: "Bigs", options: [
  //       { groupName: "Fairly big", options: ["seven", "eight", "nine"] },
  //       { groupName: "Really big", options: [ "ten", "eleven", "twelve" ] },
  //       "thirteen"
  //     ]
  //   },
  //   "one hundred",
  //   "one thousand"
  // ],

  dimensions: Ember.computed.reads('model.dimensions'),
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
      this.set('metricId', metric.id);
      this.set('primaryMetric', metric);
    },

    onGranularityChange(granularity) {
      this.set('selecteGranularity', granularity);
    },

    onFilterSelection(filter) {
      // this.set('selectedFilter', filter);
    },

    onfilterSearch(filter) {
      // this.set('selectedFilter', filter);
    },
  }
});
