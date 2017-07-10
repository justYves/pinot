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
    const { metrics, events } = getState();

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

const modeMap = {
  WoW: 1,
  Wo2W: 2,
  Wo3W: 3,
  Wo4W: 4
};

function updateDates(start, end) {
  return (dispatch, getState) => {
    const { metrics, events } = getState();
    const {
      primaryMetricId: metricId,
      compareMode
    } = metrics;

    const startDate = moment(start).valueOf();
    const endDate = moment(end).valueOf();
    const windowSize = endDate - startDate;

    const offset = modeMap[compareMode] || 1;
    const baselineStart = moment(start).subtract(offset, 'week').valueOf();

    dispatch(loading());

    // Todo: use compare mode

    return fetch(`/rootcause/query?framework=relatedEvents&current=${startDate}&baseline=${baselineStart}&windowSize=${windowSize}&metricUrn=thirdeye:metric:${metricId}`)
      .then(res => res.json())
      .then(res => dispatch(loadEvents(res)
    ));
  };
}

export const Actions = {
  loading,
  loadEvents,
  fetchEvents,
  updateDates
};
