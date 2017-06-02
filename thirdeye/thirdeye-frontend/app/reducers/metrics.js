import { ActionTypes } from '../actions/related-metrics';

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

  //data points
};

export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {

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

    case ActionTypes.LOAD_IDS: {
      const relatedMetrics = action.payload;
      const relatedMetricIds = relatedMetrics
        .sort((prev, next) => next.score > prev.score)
        .map((metric) => metric.urn.split('thirdeye:metric:')[1])

      return Object.assign(state,  {
        relatedMetricIds
      });
    }

    case ActionTypes.LOAD_DATA: {
      const relatedMetricEntities = Object.assign({}, action.payload);

      return Object.assign(state, {
        loading: false,
        loaded: true,
        failed: false,
        relatedMetricEntities
      })
    }
  }
  
  return state;
}
