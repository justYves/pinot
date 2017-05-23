import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['anomaly-graph'],
  data: Ember.computed(
    'anomaly',
    function() {
      return {
        columns: [
          ['date', ...this.get('anomaly.dates')],
          ['current', ...this.get('anomaly.currentValues')],
          ['baseline', ...this.get('anomaly.baselineValues')]
        ],
        type: 'line',
        x: 'date',
        xFormat: '%Y-%m-%d %H:%M'
      }
    }
  ),
  axis: {
    y: {
      show: true
    }, 
    x: {
      type: 'timeseries',
      show: true,
      tick: {
        fit: false
      }
    }
  },
  regions: Ember.computed('anomaly', function() {
    return [{
      axis: 'x',
      start: this.get('anomaly.anomalyRegionStart'),
      end: this.get('anomaly.anomalyRegionEnd'),
      tick : {
        format : '%m %d %Y'
      }
    }]
  })
});
