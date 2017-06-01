import { type } from './utils';
import fetch from 'fetch';
import Ember from 'ember';

/**
 * Define the action types
 */
export const ActionTypes = {
  REQUEST_READ: type('[Anomaly] Request Read'),
  LOAD: type('[Anomaly] Load'),
  LOADING: type('[Anomaly] Loading'),
  REQUEST_FAIL: type('[Anomaly] Request Fail'),
  LOAD_METRIC_IDS: type('[Anomaly] Load related Metric Ids'),
  LOAD_METRIC_DATA: type('[Anomaly] Load related Metric Data'),
};

function request(params) {
  return {
    type: ActionTypes.REQUEST_READ,
    payload: {
      params,
      source: 'search'
    }
  };
}

function loading() {
  return {
    type: ActionTypes.LOADING
  };
}

function loadAnomaly(response) {
  return {
    type: ActionTypes.LOAD,
    payload: response.anomalyDetailsList
  };
}

function requestFail() {
  return {
    type: ActionTypes.REQUEST_FAIL,
  };
}



function loadRelatedMetricIds(response) {
  return {
    type: ActionTypes.LOAD_METRIC_IDS,
    payload: response
  }
}

function loadRelatedMetricsData(response) {
  return {
    type: ActionTypes.LOAD_METRIC_DATA,
    payload: response
  }
}

function fetchData(id) {
  return (dispatch) => {
    dispatch(loading());
    // TODO: save url in an API folder
    return fetch(`/anomalies/search/anomalyIds/1492498800000/1492585200000/1?anomalyIds=${id}&functionName=`)
      .then(res => res.json())
      .then(res => dispatch(loadAnomaly(res)))
      .catch(() => dispatch(requestFail()))
  }  
}

function fetchRelatedMetricIds() {
  return (dispatch, getState) => {
    const metricId = getState().anomaly.id;
    if (!metricId) { return; }
    return fetch(`/rootcause/queryRelatedMetrics?current=1496152799999&baseline=1495609199999&windowSize=79199999&metricUrn=thirdeye:metric:${metricId}`)
      .then(res => res.json())
      .then(res => dispatch(loadRelatedMetricIds(res)))
      .catch(() => {
        // Todo: dispatch an error message
      })
  }
}

function fetchRelatedMetricData() {
  return (dispatch, getState) => {
    const AnomalyEntity = getState().anomaly;
    const { relatedMetricIds, primaryMetricId } = AnomalyEntity;
    const metricIds = [primaryMetricId, ...relatedMetricIds];
    if (!metricIds.length) { return; }
      const promiseHash = metricIds.reduce((hash,id) => {
          const url = `/timeseries/compare/${id}/1492564800000/1492593000000/1491960000000/1491988200000?dimension=All&granularity=MINUTES`
          hash[id] = fetch(url).then(res => res.json());

          return hash;
      }, {})

      return Ember.RSVP.hash(promiseHash)
        .then(res => dispatch(loadRelatedMetricsData(res)))
        .catch(() => {
          // Todo: dispatch an error message
        })
  }
}

export const Actions = {
  request,
  loading,
  loadAnomaly,
  requestFail,
  loadRelatedMetricIds,
  fetchData,
  fetchRelatedMetricIds,
  fetchRelatedMetricData
};
