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
  LOADED: type('[Events] Data loaded'),
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

function loaded() {
  return {
    type: ActionTypes.LOADED
  };
}

function fetchEvents() {
  return (dispatch, getState) => {
    const {metrics, events} = getState();

    if (events.events.length) {
      return dispatch(loaded());
    }

    let {
      primaryMetricId: metricId,
      currentStart: startDate,
      currentEnd: endDate,
      compareMode
    } = metrics;

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

function updateDates() {
  return (dispatch, getState) => {
    const store = getState();
    dispatch(loading());
  };
}

export const Actions = {
  loading,
  loadEvents,
  fetchEvents,
  updateDates
};
