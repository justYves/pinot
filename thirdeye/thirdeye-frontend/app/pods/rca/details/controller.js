import moment from 'moment';

import Controller from "@ember/controller";
import { set, get, computed, getProperties } from "@ember/object";
import { run } from '@ember/runloop';

const serverDateFormat = 'YYYY-MM-DD HH:mm';

export default Controller.extend({
  queryParams: [
    'granularity',
    'filters',
    'compareMode',
    'startDate',
    'endDate',
    'displayStart',
    'displayEnd',
    'analysisStart',
    'analysisEnd'
  ],
  granularities: computed.reads('model.granularities'),
  noMatchesMessage: '',
  filters: null,
  compareMode: null,
  compareModeOptions: ['WoW', 'Wo2W', 'Wo3W', 'Wo4W'],
  mostRecentTask: null,
  metricFilters: computed.reads('model.metricFilters'),
  subchartStart: 0,
  subchartEnd: 0,
  predefinedRanges: {},
  shouldReset: false,

  /**
   * Visibility of the entity mapping modal
   */
  showEntityMapping: false,

  /**
   * Upper bound (end) for date range
   * @type {String}
   */
  maxTime: computed(
    'model.maxTime',
    'granularity',
    function() {
      let maxTime = get(this, 'model.maxTime');
      maxTime = maxTime ? moment(maxTime) : moment();

      // edge case handling for daily granularity
      if (get(this, 'granularity') === 'DAYS') {
        maxTime.startOf('day');
      }
      return maxTime.format(serverDateFormat);
    }
  ),

  /**
   * Indicates the date format to be used based on granularity
   * @type {String}
   */
  uiDateFormat: computed('granularity', function() {
    const granularity = get(this, 'granularity');

    switch(granularity) {
      case 'DAYS':
        return 'MMM D, YYYY';
      case 'HOURS':
        return 'MMM D, YYYY h a';
      default:
        return 'MMM D, YYYY hh:mm a';
    }
  }),

  /**
   * Indicates the allowed date range picker increment based on granularity
   * @type {Number}
   */
  timePickerIncrement: computed('granularity', function() {
    const granularity = get(this, 'granularity');

    switch(granularity) {
      case 'DAYS':
        return 1440;
      case 'HOURS':
        return 60;
      default:
        return 5;
    }
  }),

  /**
   * Determines if the date range picker should show time selection
   * @type {Boolean}
   */
  showTimePicker: computed('granularity', function() {
    const granularity = get(this, 'granularity');

    return granularity !== 'DAYS';
  }),

  // converts analysisStart from unix ms to serverDateFormat
  anomalyRegionStart: computed('analysisStart', {
    get() {
      const start = get(this, 'analysisStart');

      return start ? moment(+start).format(serverDateFormat) : moment().format(serverDateFormat);
    },
    set(key, value) {
      if (!value || value === 'Invalid date') {
        return get(this, 'analysisStart') || 0;
      }

      const start = moment(value).valueOf();
      this.set('analysisStart', start);

      return moment(value).format(serverDateFormat);
    }
  }),

  // converts analysisEnd from unix ms to serverDateFormat
  anomalyRegionEnd: computed('analysisEnd', {
    get() {
      const end = get(this, 'analysisEnd');

      return end ? moment(+end).format(serverDateFormat) : moment().format(serverDateFormat);
    },
    set(key, value) {
      if (!value || value === 'Invalid date') { return get(this, 'analysisEnd') || 0; }

      const end = moment(value).valueOf();
      this.set('analysisEnd', end);

      return moment(value).format(serverDateFormat);
    }
  }),

  // converts startDate from unix ms to serverDateFormat
  viewRegionStart: computed(
    'startDate',
    {
      get() {
        const start = get(this, 'startDate');

        return start ? moment(+start).format(serverDateFormat) : moment().format(serverDateFormat);
      },
      set(key, value) {
        if (!value || value === 'Invalid date') {
          return get(this, 'startDate') || 0;
        }

        const start = moment(value).valueOf();
        const analysisStart = get(this, 'analysisStart');

        if (+start > +analysisStart) {
          this.set('shouldReset', true);
        }

        this.set('startDate', start);
        run.once(this, get(this, 'actions.resetAnalysisDates'));

        return moment(value).format(serverDateFormat);
      }
    }
  ),

  // converts endDate from unix ms to serverDateFormat
  viewRegionEnd: computed(
    'endDate',
    {
      get() {
        const end = get(this, 'endDate');

        return end ? moment(+end).format(serverDateFormat) : moment().format(serverDateFormat);
      },
      set(key, value) {
        if (!value || value === 'Invalid date') { return get(this, 'endDate') || 0; }
        const maxTime = moment(get(this, 'maxTime')).valueOf();
        const end = moment(value).valueOf();
        const newEnd = (+maxTime < +end) ? maxTime : end;
        const analysisEnd = get(this, 'analysisEnd');

        if (+newEnd < +analysisEnd) {
          this.set('shouldReset', true);
        }
        this.set('endDate', newEnd);
        run.once(this, get(this, 'actions.resetAnalysisDates'));

        return moment(value).format(serverDateFormat);
      }
    }
  ),

  // min date for the anomaly region
  minDate: computed('startDate', function() {
    const start = get(this, 'startDate');

    return moment(+start).format(serverDateFormat);
  }),

  // max date for the anomaly region
  maxDate: computed(
    'endDate',
    'granularity',
    function() {
      const {
        endDate: end,
        granularity
      } = getProperties('endDate', 'granularity');

      if (granularity === 'DAYS') {
        return moment(+end)
          .startOf('day')
          .format(serverDateFormat);
      }

      return moment(+end).format(serverDateFormat);
    }
  ),

  uiGranularity: computed(
    'granularity',
    'model.maxTime',
    'startDate', {
      get() {
        return get(this, 'granularity');
      },
      // updates dates on granularity change
      set(key, value){
        let endDate = moment(+get(this, 'model.maxTime'));
        let startDate = 0;
        let analysisEnd = 0;
        let analysisStart = 0;
        let subchartStart = 0;

        // Handles this logic here instead of inside SetupController
        // so that query params are updating properly
        if (value === 'DAYS') {
          endDate = endDate.clone().startOf('day');
          analysisEnd = endDate.clone().startOf('day');
          startDate = endDate.clone().subtract(29, 'days').startOf('day').valueOf();
          analysisStart = analysisEnd.clone().subtract('1', 'day');
          subchartStart = endDate.clone().subtract(1, 'week').startOf('day');
        } else if (value === 'HOURS') {
          analysisEnd = endDate.clone().startOf('hour');
          startDate = endDate.clone().subtract(1, 'week').startOf('day').valueOf();
          analysisStart = analysisEnd.clone().subtract('1', 'hour');
          subchartStart =  analysisEnd.clone().subtract('1', 'day').startOf('day');
        } else {
          analysisEnd =  endDate.clone().startOf('hour');
          startDate = endDate.clone().subtract(24, 'hours').startOf('hour').valueOf();
          analysisStart = analysisEnd.clone().subtract('1', 'hour');
          subchartStart = analysisEnd.clone().subtract('3', 'hours').startOf('hour');
        }

        this.setProperties({
          granularity: value,
          startDate,
          endDate: endDate.valueOf(),
          subchartStart: subchartStart.valueOf(),
          subchartEnd: analysisEnd.valueOf(),
          analysisEnd: analysisEnd.valueOf(),
          analysisStart: analysisStart.valueOf(),
          displayStart: subchartStart.valueOf(),
          displayEnd: analysisEnd.valueOf()
        });

        return value;
      }
    }),

  actions: {
    // handles graph region date change
    onRegionBrush(start, end) {
      this.setProperties({
        analysisStart: start,
        analysisEnd: end
      });
    },

    // Handles granularity change
    onGranularityChange(granularity) {
      this.set('uiGranularity', granularity);
    },

    // Set new  startDate if applicable
    setNewDate({ start, end }) {
      const rangeStart = moment(start).valueOf();
      const rangeEnd = moment(end).valueOf();

      this.setProperties({
        displayStart: rangeStart.valueOf(),
        displayEnd: rangeEnd.valueOf()
      });

      const {
        startDate: currentStart,
        endDate: currentEnd
      } = getProperties('startDate', 'endDate');
      if (rangeStart <= currentStart) {
        const newStartDate = +currentStart - (currentEnd - currentStart);

        this.setProperties({
          startDate: newStartDate
        });
      }
    },

    /**
     * Handles subchart date change (debounced)
     */
    setDateParams([start, end]) {
      run.debounce(this, get(this, 'actions.setNewDate'), { start, end }, 2000);
    },

    /**
     * Changes the compare mode
     * @param {String} compareMode baseline compare mode
     */
    onModeChange(compareMode){
      this.set('compareMode', compareMode);
    },

    onEntityMappingClick() {
      set(this, 'showEntityMappingModal', true);
    },

    /**
     * Resets anoamly and investigations regions
     */
    resetAnalysisDates() {
      let offset = 1;
      let granularity = get(this, 'granularity');
      const {
        shouldReset,
        startDate,
        endDate
      } = getProperties('shouldReset', 'startDate', 'endDate');

      if (shouldReset) {
        if (granularity.includes('minutes')) {
          granularity = 'minutes';
          offset = 5;
        }

        this.setProperties({
          analysisStart: moment(endDate).subtract(offset, granularity),
          analysisEnd: endDate,
          displayStart: startDate,
          displayEnd: endDate,
          shouldReset: false
        });
      }
    },

    onAddFilter() {
      const entity = get(this, 'selectedEntity');
      const relatedEntities = get(this, 'model.relatedEntities');

      relatedEntities.unshiftObject({
        label: entity.alias,
        urn: `thirdeye:metric:${entity.id}`,
        type: 'metric',
        isNew: true
      });
      set(this, 'selectedEntity', null);
    }
  }
});
