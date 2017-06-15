import Ember from 'ember';

export default Ember.Component.extend({
  metrics: null,
  showDetails: false,
  granularity: 'DAYS',
  primaryMetric: null,
  relatedMetrics: null,

  dateFormat: Ember.computed('granularity', function() {
    const granularity = this.get('granularity');

    // TODO: save this in a constant file
    return {
      DAYS: 'M/D',
      HOURS: 'M/D hh',
      MINUTES: 'M/D hh:mm a'
    }[granularity]
  }),

  dates: Ember.computed.reads('primaryMetric.timeBucketsCurrent'),
  
  primaryMetricRows: Ember.computed('primaryMetric', function() {
    const metrics = this.get('primaryMetric');

    return Ember.isArray(metrics) ? metrics : [metrics];
  }),

  relatedMetricRows: Ember.computed('relatedMetrics', function() {
    const metrics = this.get('relatedMetrics');

    return Ember.isArray(metrics) ? metrics : [metrics];
  }),

});
