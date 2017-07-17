import Ember from 'ember';
import _ from 'lodash';

// TODO: save this in a constant file
const GRANULARITY_MAPPING = {
  DAYS: 'M/D',
  HOURS: 'M/D h a',
  MINUTES: 'M/D hh:mm a'
};

/**
 * Helper Function
 * @param {*} rows
 * @param {*} startIndex
 * @param {*} endIndex
 */
const filterRow = (rows, startIndex, endIndex) => {
  if (!startIndex && !endIndex) {
    return rows;
  }

  const newRows = rows.map((row) => {
    const All = Object.assign({}, row.subDimensionContributionMap.All);

    const newAll = Object.keys(All).reduce((agg, key) => {
      agg[key] = _.slice(All[key], startIndex, endIndex);
      return agg;
    }, {});

    return Object.assign({}, row, { subDimensionContributionMap: {All: newAll}});
  });

  return newRows;
};

export default Ember.Component.extend({
  metrics: null,
  showDetails: false,
  granularity: 'DAYS',
  primaryMetric: [],
  relatedMetrics: [],
  dimensions: {},
  start: null,
  end: null,
  loading: false,

  didUpdateAttrs(...args) {
    Ember.run.later(() => {
      this._super(args);
      this.set('loading', false);
    });
  },

  /**
   * Determines the date format based on granularity
   */
  dateFormat: Ember.computed('granularity', function() {
    const granularity = this.get('granularity');
    return GRANULARITY_MAPPING[granularity];
  }),

  primaryMetricRows: Ember.computed('primaryMetric', function() {
    const metrics = this.get('primaryMetric');

    return Ember.isArray(metrics) ? metrics : [metrics];
  }),

  relatedMetricRows: Ember.computed('relatedMetrics', function() {
    const metrics = this.get('relatedMetrics');

    return Ember.isArray(metrics) ? metrics : [metrics];
  }),

  dimensionRows: Ember.computed('dimensions', function() {
    const dimensions = this.get('dimensions');

    return Object.keys(dimensions);
  }),



  startIndex: Ember.computed('dates', 'start', function() {
    const dates = this.get('dates');
    const start = this.get('start');

    for (let index = 0; index < dates.length; index++) {
      if (dates[index] > start) {
        return index;
      }
    }
    return false;
  }),

  endIndex: Ember.computed('dates', 'end', function() {
    const dates = this.get('dates');
    const end = this.get('end');

    for (let index = 0; index < dates.length; index++) {
      if (dates[index] > end) {
        return index;
      }
    }
    return dates.length - 1;
  }),

  filteredDates: Ember.computed(
    'startIndex',
    'endIndex',
    'dates',
    function() {
      const start = this.get('startIndex') || 0;
      const end = this.get('endIndex') || 0;

      const dates = this.get('dates');
      if (!(start && end)) {
        return dates;
      }
      return _.slice(dates, start, end);
    }
  ),

  filteredPrimaryMetricRows: Ember.computed(
    'startIndex',
    'endIndex',
    'primaryMetricRows',
    function() {
      const startIndex = this.get('startIndex') || 0;
      const endIndex = this.get('endIndex') || 0;
      const rows = this.get('primaryMetricRows');


      return filterRow(rows, startIndex, endIndex);
    }
  ),

  filteredRelatedMetricRows: Ember.computed(
    'startIndex',
    'endIndex',
    'relatedMetricRows',
     function() {
       const startIndex = this.get('startIndex') || 0;
       const endIndex = this.get('endIndex') || 0;
       const rows = this.get('relatedMetricRows');


       return filterRow(rows, startIndex, endIndex);
     }
  ),

  filteredDimensionRows: Ember.computed(
    'startIndex',
    'endIndex',
    'dimensionRows',
     function() {
       const startIndex = this.get('startIndex') || 0;
       const endIndex = this.get('endIndex') || 0;
       const dimensions = this.get('dimensions');

       if (!startIndex && !endIndex) {
         return rows;
       }


       return Object.keys(dimensions).reduce((agg, key) => {
         const dimensionsData = dimensions[key];
         const data = Object.keys(dimensionsData).reduce((agg, key) => {
           agg[key]= _.slice(dimensionsData[key], startIndex, endIndex);
           return agg;
         }, {});

         agg[key] = Object.assign({}, data);
         return agg;
       }, {});

      //  return filterRow(rows, startIndex, endIndex);
     }
  )
});
