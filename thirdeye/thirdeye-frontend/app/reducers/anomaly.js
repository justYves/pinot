import { ActionTypes } from '../actions/anomaly';
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
   * The primary metric Id
   */
  id: null,

  /**
   * The primary anomaly
   */
  entity: {},

  /**
   * List of related Metric
   */
  relatedMetricIds: [],
  startDate: moment(),
  endDate: moment(),
  granularity: 'DAYS'
};

export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case ActionTypes.LOAD: {
      const entity = action.payload.pop() || {};

      const id = entity.metricId;
      const primaryMetricId = entity.metricId;

      return Object.assign(state, {
        loading: false,
        loaded: true,
        failed: false,
        id,
        entity,
        primaryMetricId,
        granularity: entity.timeUnit,
        filters: entity.anomalyFunctionDimension,
        currentEnd: moment(entity.currentEnd).valueOf(),
        currentStart: moment(entity.currentStart).valueOf(),
        anomalyRegionStart: moment(entity.anomalyRegionStart).valueOf(),
        anomalyRegionEnd: moment(entity.anomalyRegionEnd).valueOf()
      });
    }
    case ActionTypes.LOADING:
      return Object.assign(state, {
        loading: true,
        loaded: false,
        failed: false
      });

    case ActionTypes.REQUEST_FAIL:
      return Object.assign(state, {
        loading: false,
        failed: true
      });
  }
  
  return state;
}
