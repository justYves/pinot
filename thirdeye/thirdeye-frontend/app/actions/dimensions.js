import { type } from './utils';
import fetch from 'fetch';
import moment from 'moment';

const COMPARE_MODE_MAPPING = {
  WoW: 1,
  Wo2W: 2,
  Wo3W: 3,
  Wo4W: 4
};


/**
 * Define the anomaly action types
 */
export const ActionTypes = {
  LOAD: type('[Dimensions] Load'),
  LOADING: type('[Dimensions] Loading'),
  REQUEST_FAIL: type('[Dimensions] Request Fail'),
  SET: type('[Dimension] Set Dimension'),
  LOAD_TIMESERIES: type('[Dimensions] Load TimeSeries')
};

function loading() {
  return {
    type: ActionTypes.LOADING
  };
}

function setDimension(dimension = 'All') {
  return {
    type: ActionTypes.SET,
    payload: dimension
  };
}

function loadTimeSeries(response) {
  return {
    type: ActionTypes.LOAD_TIMESERIES,
    payload: response
  };
}

function load(response, metricId) {
  return {
    type: ActionTypes.LOAD,
    payload: response,
    metricId
  };
}

function requestFail() {
  return {
    type: ActionTypes.REQUEST_FAIL
  };
}

/**
 * Fetches the anomaly details for one anomaly
 *
 */
function fetchDimensions(metricId) {
  return (dispatch, getState) => {
    const { dimensions } = getState();

    if (dimensions.metricId === metricId) {
      return {};
    }

    dispatch(loading());
    // TODO: save url in an API folder
    // need to have a new endpoint with just the anomaly details
    return fetch(`/data/autocomplete/dimensions/metric/${metricId}`)
      .then(res => res.json())
      .then(res => dispatch(load(res, metricId)))
      .catch(() => dispatch(requestFail()));
  };
}

function updateDimension(newDimension) {
  return (dispatch, getState) => {
    const { primaryMetric, dimensions } = getState();
    const {
      granularity,
      compareMode,
      analysisStart,
      analysisEnd,
      primaryMetricId
    } = primaryMetric;

    const offset = COMPARE_MODE_MAPPING[compareMode] || 1;
    const baselineStart = moment(+analysisStart).subtract(offset, 'week').valueOf();
    const baselineEnd = moment(+analysisEnd).subtract(offset, 'week').valueOf();

    newDimension = newDimension || dimensions.selectedDimension;

    // Todo use compareMode to update analysisStart and End

    const url = `timeseries/compare/${primaryMetricId}/${analysisStart}/${analysisEnd}/${baselineStart}/${baselineEnd}?dimension=${newDimension}&filters={}&granularity=${granularity}`;
    debugger;
    dispatch(setDimension(newDimension));
    return fetch(url)
      .then(res => res.json())
      .then(res => dispatch(loadTimeSeries(res)));
  };
}

export const Actions = {
  loading,
  load,
  requestFail,
  fetchDimensions,
  updateDimension
};
