import { ActionTypes } from '../actions/anomaly';

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
   * Lost of related Metric
   */
  relatedMetricIds: [],

  primaryMetricId: null,
  relatedMetricEntities: {},

  //data points
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
        id,
        entity,
        primaryMetricId
      });
    }
    case ActionTypes.LOADING:
      return Object.assign(state, {
        loading: true,
        loaded: false
      });

    case ActionTypes.REQUEST_FAIL:
      return Object.assign(state, {
        loading: false,
        failed: true
      });
  }
  
  return state;
}
