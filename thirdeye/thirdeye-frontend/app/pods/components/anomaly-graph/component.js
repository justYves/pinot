import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
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
        xFormat: '%Y-%m-%d %H:%M',
        style: 'dashed'
      }
    }
  ),
  axis: Ember.computed('anomaly', function (){
    return {
      y: {
        show: true
      }, 
      x: {
        type: 'timeseries',
        show: true,
        tick: {
          fit: false
        },
        // extent: [...this.get('anomaly.dates')].slice(1,2)
      }
    }
  }),
  regions: Ember.computed('anomaly', function() {
    return [{
      axis: 'x',
      start: this.get('anomaly.anomalyRegionStart'),
      end: this.get('anomaly.anomalyRegionEnd'),
      tick : {
        format : '%m %d %Y'
      }
    }]
  }),

  color: {
    pattern: ['#cccccc']
  },

  subchart: {
    show: true
  },
  actions: {
    onSelection() {
      this.attrs.onSelection(...arguments);
    }
  }
});
