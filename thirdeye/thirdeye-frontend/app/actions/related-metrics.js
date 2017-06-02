import { type } from './utils';
import fetch from 'fetch';
import Ember from 'ember';
/**
 * Define the action types
 */
export const ActionTypes = {
  LOADING: type('[Metric] Loading'),
  REQUEST_FAIL: type('[Metric] Request Fail'),
  LOAD_IDS: type('[Metric] Load related Metric Ids'),
  LOAD_DATA: type('[Metric] Load related Metric Data'),
};

function loading() {
  return {
    type: ActionTypes.LOADING
  };
}

function requestFail() {
  return {
    type: ActionTypes.REQUEST_FAIL,
  };
}

function loadRelatedMetricIds(response) {
  return {
    type: ActionTypes.LOAD_IDS,
    payload: response
  }
}

function loadRelatedMetricsData(response) {
  return {
    type: ActionTypes.LOAD_DATA,
    payload: response
  }
}

function fetchRelatedMetricIds() {
  return (dispatch, getState) => {
    dispatch(loading());
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
    const store = getState();
    const { primaryMetricId } = store.anomaly;
    const { relatedMetricIds } = store.metrics;
    const filters = {};
    const metricIds = [primaryMetricId, ...relatedMetricIds];

    if (!metricIds.length) { return; }
    const promiseHash = metricIds.reduce((hash,id) => {
        const url = `/timeseries/compare/${id}/1492564800000/1492593000000/1491960000000/1491988200000?dimension=All&granularity=MINUTES&filters=${JSON.stringify(filters)}`
        hash[id] = fetch(url).then(res => res.json());

        return hash;
    }, {})

    return Ember.RSVP.hash(promiseHash)
      .then(res => dispatch(loadRelatedMetricsData(res)))
      .then()
      .catch(() => {
        // Todo: dispatch an error message
      })
  }
}

export const Actions = {
  loading,
  requestFail,
  fetchRelatedMetricData,
  fetchRelatedMetricIds,
};
