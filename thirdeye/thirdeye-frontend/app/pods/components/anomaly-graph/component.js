import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['anomaly-graph'],
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
    // 'relatedMetrics',
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

  primaryMetricColumn: Ember.computed(
    'anomaly.isSelected', 
    function() {

    }
  ),

  data: Ember.computed(
    'anomaly',
    'relatedMetricsColumn',
    function() {
      return {
        columns: [
          ['date', ...this.get('anomaly.dates')],
          ['current', ...this.get('anomaly.currentValues')],
          ['baseline', ...this.get('anomaly.baselineValues')],
          ...this.get('relatedMetricsColumn')
        ],
        type: 'line',
        x: 'date',
        xFormat: '%Y-%m-%d %H:%M',
        style: 'dashed',
        colors: {
            current: '#006097',
            baseline: '#006097',
        },
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
      },
      class: 'c3-region__blue'
    }]
  }),

  color: {
    // pattern: ['#006097', '#006097', '#b74700', '#b74700']
  },

  subchart: {
    show: true
  },
  actions: {
    onSelection() {
      this.attrs.onSelection(...arguments);
    },
    onmouseover() {
      debugger;
    }
  }
});
