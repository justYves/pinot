import { type } from './utils';
import fetch from 'fetch';
import Ember from 'ember';
import moment from 'moment'
/**
 * Define the action types
 */
export const ActionTypes = {
  LOADING: type('[Metric] Loading'),
  REQUEST_FAIL: type('[Metric] Request Fail'),
  LOAD_IDS: type('[Metric] Load related Metric Ids'),
  LOAD_DATA: type('[Metric] Load related Metric Data'),
  LOAD_REGIONS: type('[Metric] Load Metric Regions')
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

function loadRegions(response) {
  return {
    type: ActionTypes.LOAD_REGIONS,
    payload: response
  }
}

function fetchRelatedMetricIds() {
  return (dispatch, getState) => {
    dispatch(loading());
    
    const { 
      id: metricId,
      currentStart,
      currentEnd
    } = getState().anomaly;

    const baselineStart = moment(currentStart).subtract(1, 'week').valueOf();
    const windowSize = Math.max(currentEnd - currentStart, 0);
    if (!metricId) { return; }
    // todo: identify better way for query params
    return fetch(`/rootcause/queryRelatedMetrics?current=${currentStart}&baseline=${baselineStart}&windowSize=${windowSize}&metricUrn=thirdeye:metric:${metricId}`)
      .then(res => res.json())
      .then(res => dispatch(loadRelatedMetricIds(res)))
      .catch(() => {
        // Todo: dispatch an error message
      })
  }
}

function fetchRegions() {
  return (dispatch, getState) => {
    const store = getState();
    const { primaryMetricId, filters, startDate, endDate } = store.anomaly;
    const { relatedMetricIds } = store.metrics;

    const metricIds = [primaryMetricId, ...relatedMetricIds].join(',');
    debugger;
     // todo: identify better way for query params
    return fetch(`/data/anomalies/ranges?metricIds=${metricIds}&start=${startDate}&end=${endDate}&filters=${filters}`)
      .then(res => res.json())
      .then(res => dispatch(loadRegions(res)))
      .catch(() => {
        // Todo: dispatch an error message
      })

  }
}

function fetchRelatedMetricData() {
  return (dispatch, getState) => {
    const store = getState();
    const { primaryMetricId, filters, granularity} = store.anomaly;
    const { relatedMetricIds } = store.metrics;

    //get start date and end date from here
    // const { start, end } = store.anomaly;
    const metricIds = [primaryMetricId, ...relatedMetricIds];

    if (!metricIds.length) { return; }
    const promiseHash = metricIds.reduce((hash,id) => {
      const url = `/timeseries/compare/${id}/1492564800000/1492593000000/1491960000000/1491988200000?dimension=All&granularity=${granularity}&filters=${filters}`
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
  fetchRegions
};

