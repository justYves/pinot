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
      const anomalyList = action.payload;
      let id = null;
      let entity = {};
      let primaryMetricId = null;
      // new: 
      try {
        id = anomalyList[0].metricId;
        primaryMetricId = anomalyList[0].metricId;
        entity = anomalyList[0];
      } catch(e) {
        return new Error();
      }
      // const ids = anomalyList.map((anomaly) => anomaly.metricId);
      // const entities = anomalyList.reduce((entities, anomaly) => {
      //   entities[anomaly.metricId] = anomaly;
      //   return entities;
      // }, {});

      return Object.assign(state, {
        loading: false,
        loaded: true,
        // ids,
        // entities,
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
    
    case ActionTypes.LOAD_METRIC_IDS: {
      const relatedMetrics = action.payload;
      const relatedMetricIds = relatedMetrics
        .sort((prev, next) => next.score > prev.score)
        .map((metric) => metric.urn.split('thirdeye:metric:')[1])
      // const relatedMetricEntities = relatedMetrics.reduce((entities, metric) => {
      //   const id = metric.urn.split('thirdeye:metric:')[1];
      //   entities[id] = metric;
      //   return entities;
      // },{})
      return Object.assign(state, {
        // relatedMetricEntities,
        relatedMetricIds
      });
    }

    case ActionTypes.LOAD_METRIC_DATA: {
      const relatedMetricEntities = Object.assign({}, action.payload);

      return Object.assign(state, {
        relatedMetricEntities
      })
    }
  }
  
  return state;
}
