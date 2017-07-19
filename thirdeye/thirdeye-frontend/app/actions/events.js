import { type } from './utils';
import fetch from 'fetch';
import moment from 'moment';

import { colors } from './constants';

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
  UPDATE_DATE: type('[Events] Update Date'),
  RESET: type('[Event] Reset Data')
};

const modeMap = {
  WoW: 1,
  Wo2W: 2,
  Wo3W: 3,
  Wo4W: 4
};

function resetData() {
  return {
    type: ActionTypes.RESET
  };
}

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

const eventColorMapping = {
  holiday: 'green',
  informed: 'red',
  gcn: 'orange'
};

const assignEventColor = (event) => {
  const color = eventColorMapping[event.eventType];

  return Object.assign(event, { color });
};

function fetchEvents(start, end, mode) {
  return (dispatch, getState) => {
    const { primaryMetric, events } = getState();

    // cahce results if no change
    // if (events.events.length) {
    //   return dispatch(loaded());
    // }

    let {
      primaryMetricId: metricId,
      currentStart: startDate = moment(endDate).subtract(1, 'week').valueOf(),
      currentEnd: endDate = moment().subtract(1, 'day').endOf('day').valueOf(),
      compareMode
    } = primaryMetric;

    const diff = Math.floor((endDate - startDate) / 4);
    endDate = end || (+endDate - diff);
    startDate = start || (+startDate + diff);
    mode = mode || compareMode;

    const offset = modeMap[compareMode] || 1;
    const baselineStart = moment(startDate).clone().subtract(offset, 'week').valueOf();
    const windowSize = Math.max(endDate - startDate, 0);

    dispatch(loading());
    return fetch(`/rootcause/query?framework=relatedEvents&current=${startDate}&baseline=${baselineStart}&windowSize=${windowSize}&urns=thirdeye:metric:${metricId}`)
      .then(res => res.json())
      .then((res) => {
        return res.map((event) => {
          return assignEventColor(event);
        });
      })
      .then(res => dispatch(loadEvents(res)
    ));
  };
}

function updateDates(start, end, compareMode) {
  return (dispatch, getState) => {

    const { primaryMetric } = getState();

    if (primaryMetric.selectedEvents.length) {
      return;
    }
    compareMode = compareMode || primaryMetric.compareMode;

    return dispatch(fetchEvents(start, end, compareMode));
  };
}

function reset() {
  return (dispatch) => {
    dispatch(resetData());
    return Promise.resolve();
  };
}

export const Actions = {
  loading,
  loaded,
  loadEvents,
  fetchEvents,
  updateDates,
  reset
};
