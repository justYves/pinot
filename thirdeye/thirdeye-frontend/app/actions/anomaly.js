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

function fetchData(id) {
  return (dispatch) => {
    dispatch(loading());
    // TODO: save url in an API folder
    // need to have a new endpoint with just the anomaly details
    return fetch(`/anomalies/search/anomalyIds/1492498800000/1492585200000/1?anomalyIds=${id}&functionName=`)
      .then(res => res.json())
      .then(res => dispatch(loadAnomaly(res)))
      .catch(() => dispatch(requestFail()))
  }  
}

export const Actions = {
  request,
  loading,
  loadAnomaly,
  requestFail,
  fetchData
};
