import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['anomaly-graph'],
  primaryMetric: null,
  relatedMetrics: null,
  showGraphLegend: false,

  c3chart: null,
  size: {
    height: 400
  },

  showLegend: false,
  legend: Ember.computed('showLegend', function() {
    const showLegend = this.get('showLegend');
    return {
      position: 'inset',
      show: showLegend
    }
  }),

  relatedMetricsColumn: Ember.computed(
    'relatedMetrics',
    'relatedMetrics.@each.isSelected',
    function() {
      const columns = [];
      this.get('relatedMetrics')
      .filterBy('isSelected')
      .forEach((metric)  => {
        if (!metric) { return }
        const { baselineValues, currentValues } = metric.subDimensionContributionMap['All'];
        columns.push([`${metric.metricName}-current`, ...currentValues])
        columns.push([`${metric.metricName}-baseline`, ...baselineValues])
      })
      return columns;
    }
  ),

  chartDates: Ember.computed(
    'primaryMetric.timeBucketsCurrent',
    function() {
      
      return ['date', ...this.get('primaryMetric.timeBucketsCurrent')];
    }
  ),

  primaryMetricColumn: Ember.computed(
    'primaryMetric',
    'primaryMetric.isSelected',
    function() {
      const primaryMetric = this.get('primaryMetric');

      if (!primaryMetric.isSelected) {
        return [];
      }
      const { baselineValues, currentValues } = primaryMetric.subDimensionContributionMap['All'];
      return [
        [`${primaryMetric.metricName}-current`, ...currentValues],
        [`${primaryMetric.metricName}-baseline`, ...baselineValues]
      ]
    }
  ),

  data: Ember.computed(
    'primaryMetricColumn',
    'relatedMetricsColumn',
    'chartDates',
    function() {
      return {
        columns: [
          this.get('chartDates'),
          ...this.get('primaryMetricColumn'),
          ...this.get('relatedMetricsColumn')
        ],
        type: 'line',
        x: 'date',
        xFormat: '%Y-%m-%d %H:%M',
        style: 'dashed',
        //  ideally we'll do this:
        // colors: {
        //     current: '#006097',
        //     baseline: '#006097',
        // },
      }
    }
  ),

  // color: Ember.computed('primary')
  axis: Ember.computed('primaryMetric', function (){
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
      },
      class: 'c3-region__blue'
    }]
  }),

  color: {
    pattern: ['#1f77b4', '#1f77b4', '#aec7e8', '#aec7e8', '#ff7f0e', '#ff7f0e', '#ffbb78', '#ffbb78', '#2ca02c', '#2ca02c', '#98df8a', '#98df8a', '#d62728', '#d62728', '#ff9896', '#ff9896', '#9467bd', '#9467bd', '#c5b0d5', '#c5b0d5', '#8c564b', '#8c564b', '#c49c94', '#c49c94', '#e377c2', '#e377c2', '#f7b6d2', '#f7b6d2', '#7f7f7f', '#7f7f7f', '#c7c7c7', '#c7c7c7', '#bcbd22', '#bcbd22', '#dbdb8d', '#dbdb8d', '#17becf', '#17becf', '#9edae5', '#9edae5']
  },

  subchart: {
    show: true
  },
  actions: {
    onSelection() {
      this.attrs.onSelection(...arguments);
    },
    onToggle() {
      this.toggleProperty('showGraphLegend');
    }
  }
});
