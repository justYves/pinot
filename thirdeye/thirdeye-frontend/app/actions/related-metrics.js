import { type } from './utils';

/**
 * Define the action types
 */
export const ActionTypes = {
  REQUEST_READ: type('[Related Metrics] Request Read'),
  LOAD: type('[Related Metrics] Load'),
  LOADING: type('[Related Metrics] Loading'),
  REQUEST_FAIL: type('[Related Metrics] Request Fail'),
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

function loadRelatedMetric(response) {
  return {
    type: ActionTypes.LOAD,
    payload: response
  };
}

function requestFail() {
  return {
    type: ActionTypes.REQUEST_FAIL,
  };
}

export const Actions = {
  request,
  loading,
  loadRelatedMetric,
  requestFail
};
