import { ActionTypes } from '../actions/primary-metric';
import moment from 'moment';

/**
 * Define the schema
 */
const INITIAL_STATE = {

  /**
   * State for loading
   */
  loading: false,

  /**
   * State for loaded
   */
  loaded: false,

  /**
   * State for failed request
   */
  failed: false,

  /**
   * Lost of related Metric
   */
  relatedMetricIds: [],

  primaryMetricId: null,
  relatedMetricEntities: {},
  regions: {},
  currentStart: null,
  currentEnd: moment().subtract(1, 'week').valueOf(),
  filters: {},
  granularity: 'DAYS',
  compareMode: 'WoW',
  splitView: false
};

const modeMap = {
  WoW: 1,
  Wo2W: 2,
  Wo3W: 3,
  Wo4W: 4
};

export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case ActionTypes.LOADING:
      return Object.assign(state, {
        loading: true,
        loaded: false,
        failed: false
      });

    case ActionTypes.LOAD_PRIMARY_METRIC: {
      let {
        id: primaryMetricId,
        startDate,
        endDate,
        filters = "{}",
        granularity,
        compareMode
      } = action.payload;


      startDate = Number(startDate);
      endDate = Number(endDate);
      const offset = modeMap[compareMode] || 1;
      const baselineStart = moment(startDate).clone().subtract(offset, 'week').valueOf();
      const baselineEnd = moment(endDate).clone().subtract(offset, 'week').valueOf();

      return Object.assign(state, {
        primaryMetricId,
        currentStart: startDate,
        currentEnd: endDate,
        baselineStart,
        baselineEnd,
        filters,
        granularity,
        compareMode,
        loading: true,
        loaded: false,
        failed: false
      });
    }

    case ActionTypes.REQUEST_FAIL:
      return Object.assign(state, {
        loading: false,
        failed: true
      });

    case ActionTypes.LOAD_IDS: {
      const relatedMetrics = action.payload;
      const relatedMetricIds = relatedMetrics
        .sort((prev, next) => next.score > prev.score)
        .map((metric) => Number(metric.urn.split('thirdeye:metric:').pop()));

      return Object.assign(state,  {
        relatedMetricIds
      });
    }

    case ActionTypes.LOAD_REGIONS: {
      const payload = action.payload;
      const regions = Object.keys(payload).reduce((aggr, id) => {
        aggr[id] = {regions: payload[id]};
        return aggr;
      }, {});

      return Object.assign(state, {
        regions
      });
    }

    case ActionTypes.LOAD_DATA: {
      const relatedMetricEntities = Object.assign({}, action.payload);

      return Object.assign(state, {
        loading: false,
        loaded: true,
        failed: false,
        relatedMetricEntities
      });
    }

    case ActionTypes.UPDATE_COMPARE_MODE: {
      const compareMode = action.payload;

      const offset = modeMap[compareMode] || 1;
      const baselineStart = moment(state.currentStart).clone().subtract(offset, 'week').valueOf();
      const baselineEnd = moment(state.currentEnd).clone().subtract(offset, 'week').valueOf();


      return Object.assign(state, {
        compareMode,
        baselineStart,
        baselineEnd
      });
    }

    case ActionTypes.UPDATE_DATE: {
      const { currentStart, currentEnd } = action.payload;

      return Object.assign(state, {
        currentStart,
        currentEnd,
        loading: true,
        loaded: false,
        failed: false
      });
    }
  }
  return state;
}
