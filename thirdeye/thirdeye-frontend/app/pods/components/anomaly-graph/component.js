import Ember from 'ember';
import _ from 'lodash';

const d3 = window.d3;

//Todo: move this into a constants.js file
const COLOR_MAPPING = {
  blue: '#33AADA',
  orange: '#EF7E37',
  teal: '#17AFB8',
  purple: '#9896F2',
  red: '#FF6C70',
  green: '#6BAF49',
  pink: '#FF61b6'
};

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
    // alert('init!' + this.get('componentId'));
  },

  didUpdateAttrs() {
    this._super(...arguments);
    // alert('attributes changed' + this.get('componentId'));
  },
  /**
   * Maps each metric to a color / class
   */
  didReceiveAttrs() {
    this._super(...arguments);

    const colors = {};
    const primaryMetric = this.get('primaryMetric');
    const relatedMetric = this.get('relatedMetrics') || [];
    const selectedMetrics = this.get('selectedMetrics') || [];
    const metrics = [primaryMetric, ...relatedMetric, ...selectedMetrics];
    metrics.forEach((metric) => {
      const name = metric.metricName;
      const color = metric.color || 'blue';
      colors[`${name}-current`] = COLOR_MAPPING[color];
      colors[`${name}-baseline`] = COLOR_MAPPING[color];
    });
    this.set('colors', colors);
  },

  tagName: 'div',
  classNames: ['anomaly-graph'],
  primaryMetric: {},
  relatedMetrics: [],
  selectedMetrics: [],
  dimensions: {},
  selectedDimensions: {},

  showGraphLegend: true,
  colors: {},
  showSubChart: false,
  subchartStart: null,
  subchartEnd: null,
  showLegend: false,
  showSubchart: false,
  showTitle: false,
  height: 0,
  componentId: 'main-graph',

  initStart: null,
  initEnd: null,

  showEvents: false,
  showDimensions: false,
  showMetrics: false,
  events: [],

  primaryMetricId: Ember.computed('componentId', function() {
    return this.get('componentId') + '-primary-metric-';
  }),

  relatedMetricId: Ember.computed('componentId', function() {
    return this.get('componentId') + '-related-metric-';
  }),

  dimensionId:  Ember.computed('componentId', function() {
    return this.get('componentId') + '-dimension-';
  }),

  holidayEvents: Ember.computed('events', function() {
    const events = this.get('events');

    return events.filterBy('eventType', 'holiday');
  }),

  holidayEventsColumn: Ember.computed(
    'holidayEvents',
    function() {
      const holidays = this.get('holidayEvents');

      return holidays.map((holiday) => {
        return [holiday.label, holiday.score, holiday.score];
      });
    }
  ),

  holidayEventsDatesColumn: Ember.computed(
    'holidayEvents',
    function() {
      const holidays = this.get('holidayEvents');

      return holidays.map((holiday) => {
        return [`${holiday.label}-date`, holiday.start, holiday.end];
      });
    }
  ),

  /**
   * Graph Legend config
   */
  legend: Ember.computed('showLegend', function() {
    const showLegend = this.get('showLegend');
    return {
      position: 'inset',
      show: showLegend
    };
  }),

  /**
   * Graph Zoom config
   */
  zoom: Ember.computed('onSubchartChange', function() {
    const onSubchartBrush = this.get('onSubchartChange');
    return {
      enabled: true,
      onzoomend: onSubchartBrush
    };
  }),

  /**
   * Graph Point Config
   */
  point: Ember.computed(
    'showGraphLegend',
    function() {
      return {
        show: true,
        r: function(data) {
          const { id } = data;
          if (id.includes('current') || id.includes('baseline')) {
            return 0;
          }
          data.id.includes('current');

          return 5;
        }
      };
    }
  ),

  //events points
  //   point: Ember.computed(
  //   'showGraphLegend',
  //   function() {
  //     return {
  //       show: true,
  //       r: 10
  //     };
  //   }
  // ),

  /**
   * Graph axis config
   */
  axis: Ember.computed(
    'primaryMetric.timeBucketsCurrent',
    'primaryMetric',
    'subchartStart',
    'subchartEnd',
    'showEvents',
    'minDate',
    'maxDate',
    function() {
      const dates = this.get('primaryMetric.timeBucketsCurrent');
      const subchartStart = this.get('subchartStart');
      const subchartEnd = this.get('subchartEnd');

      const startIndex = Math.floor(dates.length / 4);
      const endIndex = Math.ceil(dates.length * (3/4));
      const extentStart = subchartStart
        ? Number(subchartStart)
        : dates[startIndex];

      const extentEnd = subchartEnd
        ? Number(subchartEnd)
        : dates[endIndex];

      return {
        y: {
          show: true,
          tick: {
            format: d3.format("2s")
          }
        },
        y2: {
          show: this.get('showEvents'),
          label: 'events score'
        },
        x: {
          type: 'timeseries',
          show: true,
          min: this.get('minDate'),
          max: this.get('maxDate'),
          tick: {
            fit: false
            // format: function (x) { return new Date(x).toString(); }
          },
          // TODO: add the extent functionality
          extent: [extentStart, extentEnd]
        }
      };
    }
  ),

  /**
   * Graph Subchart Config
   */
  subchart: Ember.computed(
    'showLegend',
    'showSubchart',
    'showGraphLegend',
    function() {
      const showSubchart = this.get('showGraphLegend') || this.get('showSubchart');
      const onSubchartBrush = this.get('onSubchartChange');
      return {
        show: showSubchart,
        onbrush: onSubchartBrush
      };
    }
  ),

  /**
   * Graph Height Config
   */
  size: Ember.computed(
    'showLegend',
    'height',
    function() {
      const height = this.get('height')
        || this.get('showLegend') ? 400 : 200;
      return {
        height
      };
    }
  ),

  /**
   * Data massages primary Metric into a Column
   */
  primaryMetricColumn: Ember.computed(
    'primaryMetric',
    function() {
      const primaryMetric = this.get('primaryMetric');

      const { baselineValues, currentValues } = primaryMetric.subDimensionContributionMap['All'];
      return [
        [`${primaryMetric.metricName}-current`, ...currentValues],
        [`${primaryMetric.metricName}-baseline`, ...baselineValues]
      ];
    }
  ),

  /**
   * Data massages relatedMetrics into Columns
   */
  selectedMetricsColumn: Ember.computed(
    'selectedMetrics',
    'selectedMetrics.@each',
    function() {
      const columns = [];
      const selectedMetrics = this.get('selectedMetrics') || [];

      selectedMetrics.forEach((metric)  => {
        if (!metric) { return; }
        const { baselineValues, currentValues } = metric.subDimensionContributionMap['All'];
        columns.push([`${metric.metricName}-current`, ...currentValues]);
        columns.push([`${metric.metricName}-baseline`, ...baselineValues]);
      });
      return columns;
    }
  ),

  selectedDimensionsColumn: Ember.computed(
    'selectedDimensions',
    function() {
      const columns = [];
      const selectedDimensions = this.get('selectedDimensions') || {};

      Object.keys(selectedDimensions).forEach((key) => {
        const { baselineValues, currentValues } = selectedDimensions[key];
        columns.push([`${key}-current`, ...currentValues]);
        columns.push([`${key}-baseline`, ...baselineValues]);
      });
      return columns;
    }
  ),
  /**
   * Derives x axis from the primary metric
   */
  chartDates: Ember.computed(
    'primaryMetric.timeBucketsCurrent',
    function() {
      return ['date', ...this.get('primaryMetric.timeBucketsCurrent')];
    }
  ),

  /**
   * Aggregates data for chart
   */
  data: Ember.computed(
    'primaryMetricColumn',
    'selectedMetricsColumn',
    'selectedDimensionsColumn',
    'holidayEventsColumn',
    'holidayEventsDatesColumn',
    'chartDates',
    'colors',
    function() {
      const {
        primaryMetricColumn,
        selectedMetricsColumn,
        selectedDimensionsColumn,
        holidayEventsColumn,
        holidayEventsDatesColumn
      } = this.getProperties(
        'primaryMetricColumn',
        'selectedMetricsColumn',
        'selectedDimensionsColumn',
        'holidayEventsDatesColumn',
        'holidayEventsColumn');

      const columns = [
        ...primaryMetricColumn,
        ...selectedMetricsColumn,
        ...selectedDimensionsColumn
      ];

      const holidayAxis = holidayEventsColumn
        .map(column => column[0])
        .reduce((hash, columnName) => {
          hash[columnName] = `${columnName}-date`;

          return hash;
        }, {});

      const holidayAxes = holidayEventsColumn
        .map(column => column[0])
        .reduce((hash, columnName) => {
          hash[columnName] = 'y2';

          return hash;
        }, {});

      const xAxis = columns
        .map(column => column[0])
        .reduce((hash, columnName) => {
          hash[columnName] = 'date';

          return hash;
        }, {});

      return {
        xs: Object.assign({}, xAxis, holidayAxis),
        axes: Object.assign({ y2: 'y2'}, holidayAxes),
        columns: [
          this.get('chartDates'),
          ...holidayEventsColumn,
          ...holidayEventsDatesColumn,
          ...columns
        ],
        type: 'line',
        // x: 'date',
        xFormat: '%Y-%m-%d %H:%M',
        colors: this.get('colors')
      };
    }
  ),

  /**
   * Data massages Primary Metric's region
   * and assigns color class
   */
  primaryRegions: Ember.computed('primaryMetric', function() {
    const primaryMetric = this.get('primaryMetric');
    const { regions } = primaryMetric;

    if (!regions) { return []; }

    return regions.map((region) => {
      return {
        axis: 'x',
        start: region.start,
        end: region.end,
        tick: {
          format: '%m %d %Y'
        },
        class: `c3-region--${primaryMetric.color}`
      };

    });
  }),

  /**
   * Data massages Primary Metric's region
   * and assigns color class
   */
  relatedRegions: Ember.computed(
    'selectedMetrics',
    'selectedMetrics.@each',
    function() {
      const selectedMetrics = this.get('selectedMetrics') || [];
      debugger;
      const regions = [];
      selectedMetrics.forEach((metric)=> {

        if (!metric.regions) { return; }

        const metricRegions = metric.regions.map((region) => {
          return {
            axis: 'x',
            start: region.start,
            end: region.end,
            tick: {
              format: '%m %d %Y'
            },
            class: `c3-region--${metric.color}`
          };
        });
        regions.push(...metricRegions);
      });

      return regions;
    }
  ),


  /**
   * Aggregates chart regions
   */
  regions: Ember.computed('primaryRegions', 'relatedRegions', function() {
    return [...this.get('primaryRegions'), ...this.get('relatedRegions')];
  }),

  actions: {
    onSelection() {
      this.attrs.onSelection(...arguments);
    },
    onToggle() {
      this.toggleProperty('showGraphLegend');
    }
  }
});
