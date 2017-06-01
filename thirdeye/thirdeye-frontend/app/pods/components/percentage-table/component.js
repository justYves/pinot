import Ember from 'ember';

export default Ember.Component.extend({
    dates: Ember.computed(
        'metrics', 
        function() {
           return this.get('metrics.firstObject') && this.get('metrics.firstObject').timeBucketsCurrent;
    }),
});
