import Ember from 'ember';

export default Ember.Component.extend({
  rows: Ember.computed('metrics', function() {
    const metrics = this.get('metrics');

    return Ember.isArray(metrics) ? metrics : [metrics];
  }),

  dates: Ember.computed(
    'metrics', 
    function() {
      return this.get('rows.firstObject') && this.get('rows.firstObject').timeBucketsCurrent;
    }
  ),
});
