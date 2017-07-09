import { type } from './utils';
import fetch from 'fetch';
import Ember from 'ember';
import moment from 'moment';

/**
 * Define the metric action types
 */
export const ActionTypes = {
  LOADING: type('[Events] Loading'),
  REQUEST_FAIL: type('[Events] Request Fail'),
  LOAD_EVENTS: type('[Events] Load events'),
  LOAD_DATA: type('[Events] Load related Metric Data'),
  LOAD_REGIONS: type('[Events] Load Metric Regions'),
  LOAD_PRIMARY_METRIC: type('[Events] Load Primary Metric'),
  UPDATE_COMPARE_MODE: type('[Events] Update Compare Mode'),
  UPDATE_DATE: type('[Events] Update Date')
};

function loading() {
  return {
    type: ActionTypes.LOADING
  };
}

function loadEvents(response) {
  return {
    type: ActionTypes.LOAD_EVENTS,
    payload: response
  };
}

function fetchEvents() {
  return (dispatch, getState) => {
    const store = getState();

    let {
      primaryMetricId: metricId,
      currentStart: startDate,
      currentEnd: endDate
    } = store.metrics;

    endDate = endDate || moment().subtract(1, 'day').endOf('day').valueOf();
    startDate = startDate || moment(endDate).subtract(1, 'week').valueOf();

    const baselineStart = moment(startDate).subtract(1, 'week').valueOf();
    const windowSize = Math.max(endDate - startDate, 0);

    dispatch(loading());
    return fetch(`/rootcause/query?framework=relatedEvents&current=${startDate}&baseline=${baselineStart}&windowSize=${windowSize}&metricUrn=thirdeye:metric:${metricId}`)
      .then(res => res.json())
      .then(res => dispatch(loadEvents(res)
    ));
  };
}

export const Actions = {
  loading,
  loadEvents,
  fetchEvents
};
