import Ember from 'ember';

export default Ember.Component.extend({
  metrics: null,
  showDetails: false,
  granularity: 'DAYS',

  dateFormat: Ember.computed('granularity', function() {
    const granularity = this.get('granularity');

    // TODO: save this in a constant file
    return {
      DAYS: 'M/D',
      HOURS: 'M/D hh',
      MINUTES: 'M/D hh:mm a'
    }[granularity]
  }),
  
  rows: Ember.computed('metrics', function() {
    const metrics = this.get('metrics');

    return Ember.isArray(metrics) ? metrics : [metrics];
  }),

  didUpdateAttrs() {
    this._super(...arguments);
    debugger;
  },

  dates: Ember.computed(
    'metrics', 
    function() {
      return this.get('rows.firstObject') && this.get('rows.firstObject').timeBucketsCurrent;
    }
  ),
});
