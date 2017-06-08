import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['anomaly-graph'],
  primaryMetric: null,
  relatedMetrics: null,
  showGraphLegend: true,

  c3chart: null,

  showLegend: false,
  legend: Ember.computed('showLegend', function() {
    const showLegend = this.get('showLegend');
    return {
      position: 'inset',
      show: showLegend
    }
  }),

  zoom: {
    enabled: true
  },

  point: Ember.computed(
    'showGraphLegend', 
    function() {
      return {
        show: !this.get('showGraphLegend'),
      }
    }
  ),

  relatedMetricsColumn: Ember.computed(
    'relatedMetrics',
    'relatedMetrics.@each.isSelected',
    function() {
      const columns = [];
      const relatedMetrics = this.get('relatedMetrics') || [];

      
      relatedMetrics
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

      // if (!primaryMetric.isSelected) {
      //   return [];
      // }
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
  axis: Ember.computed(
    'primaryMetric', 
    function () {
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
    }
  ),
  regions: Ember.computed('anomaly', function() {
    return [];
    // return [{
    //   axis: 'x',
    //   start: this.get('anomaly.anomalyRegionStart'),
    //   end: this.get('anomaly.anomalyRegionEnd'),
    //   tick : {
    //     format : '%m %d %Y'
    //   },
    //   class: 'c3-region__blue'
    // }]
  }),

  color: {
    pattern: [
      "#aec7e8",
      "#1f77b4",
      "#ff7f0e",
      "#ffbb78",
      "#2ca02c",
      "#98df8a",
      "#d62728",
      "#ff9896",
      "#9467bd",
      "#c5b0d5",
      "#8c564b",
      "#c49c94",
      "#e377c2",
      "#f7b6d2",
      "#7f7f7f",
      "#c7c7c7",
      "#bcbd22",
      "#dbdb8d",
      "#17becf",
      "#9edae5"
    ]
  },

  subchart: Ember.computed('showGraphLegend',
    function() {
      return {
        show: this.get('showGraphLegend')
      }
    }
  ),

  size: Ember.computed('showGraphLegend',
    function() {
      const height = this.get('showGraphLegend') ? 400 : 200;
      return {
        height
      }
    }
  ),

  actions: {
    onSelection() {
      this.attrs.onSelection(...arguments);
    },
    onToggle() {
      this.toggleProperty('showGraphLegend');
    }
  }
});
