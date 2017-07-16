import { type } from './utils';
import fetch from 'fetch';
import Ember from 'ember';
import moment from 'moment';
/**
 * Define the metric action types
 */
export const ActionTypes = {
  LOADING: type('[Primary Metric] Loading'),
  REQUEST_FAIL: type('[Primary Metric] Request Fail'),
  LOAD_IDS: type('[Primary Metric] Load related Primary Metric Ids'),
  LOAD_DATA: type('[Primary Metric] Load related Primary Metric Data'),
  LOAD_REGIONS: type('[Primary Metric] Load Primary Metric Regions'),
  LOAD_PRIMARY_METRIC: type('[Primary Metric] Load Primary Primary Metric'),
  UPDATE_COMPARE_MODE: type('[Primary Metric] Update Compare Mode'),
  UPDATE_DATES: type('[Primary Metric] Update Date'),
  SELECT_DIMENSION: type('[Metric] Set Selected Dimension')
};

// Todo: move this in a constant.js file
const COMPARE_MODE_MAPPING = {
  WoW: 1,
  Wo2W: 2,
  Wo3W: 3,
  Wo4W: 4
};

function loading() {
  return {
    type: ActionTypes.LOADING
  };
}

function requestFail() {
  return {
    type: ActionTypes.REQUEST_FAIL
  };
}

function loadRelatedMetricsData(response) {
  return {
    type: ActionTypes.LOAD_DATA,
    payload: response
  };
}

function loadRegions(response) {
  return {
    type: ActionTypes.LOAD_REGIONS,
    payload: response
  };
}

function setPrimaryMetricData(response) {
  return {
    type: ActionTypes.LOAD_PRIMARY_METRIC,
    payload: response
  };
}

function updateCompareMode(response) {
  return {
    type: ActionTypes.UPDATE_COMPARE_MODE,
    payload: response
  };
}

function updateDates(response) {
  return {
    type: ActionTypes.UPDATE_DATES,
    payload: response
  };
}

function setSelectedDimension(response) {
  debugger;
  return {
    type: ActionTypes.SELECT_DIMENSION,
    payload: response
  };
}


/**
 * Initialize store with metric data from query params
 * @param {Object} metric
 */
function setPrimaryMetric(metric) {
  return (dispatch) => {
    dispatch(setPrimaryMetricData(metric));
    return Promise.resolve();
  };
}

/**
 * Fetches anomaly regions for metrics
 */
function fetchRegions() {
  return (dispatch, getState) => {
    const store = getState();
    const {
      primaryMetricId,
      relatedMetricIds,
      filters,
      currentStart,
      currentEnd
    } = store.primaryMetric;

    const metricIds = [primaryMetricId, ...relatedMetricIds].join(',');
     // todo: identify better way for query params
    return fetch(`/data/anomalies/ranges?metricIds=${metricIds}&start=${currentStart}&end=${currentEnd}&filters=${filters}`)
      .then(res => res.json())
      .then(res => dispatch(loadRegions(res)))
      .catch(() => {
        dispatch(requestFail());
      });

  };
}

/**
 * Redux Thunk that fetches the data for related Metrics
 */
function fetchRelatedMetricData() {
  return (dispatch, getState) => {
    const store = getState();
    const {
      primaryMetricId,
      filters,
      granularity,
      currentStart,
      currentEnd,
      compareMode
    } = store.primaryMetric;


    const offset = COMPARE_MODE_MAPPING[compareMode] || 1;
    const metricIds = [primaryMetricId];
    const baselineStart = moment(+currentStart).subtract(offset, 'week').valueOf();
    const baselineEnd = moment(+currentEnd).subtract(offset, 'week').valueOf();

    if (!metricIds.length) { return; }
    const promiseHash = metricIds.reduce((hash, id) => {
      const url = `/timeseries/compare/${id}/${currentStart}/${currentEnd}/${baselineStart}/${baselineEnd}?dimension=All&granularity=${granularity}&filters=${filters}`;
      hash[id] = fetch(url).then(res => res.json());

      return hash;
    }, {});

    return Ember.RSVP.hash(promiseHash)
      .then(res => dispatch(loadRelatedMetricsData(res)))
      .catch(() => {
        dispatch(requestFail());
      });
  };
}

function updateMetricDate(startDate, endDate) {
  return (dispatch, getState) => {

    const store = getState();
    const {
      currentStart,
      currentEnd
    } = store.primaryMetric;
    startDate = startDate? moment(Number(startDate)) : startDate;
    endDate = endDate ? moment(Number(endDate)) : endDate;

    dispatch(updateDates({
      analysisStart: startDate.valueOf(),
      analysisEnd: endDate.valueOf()
    }));

    // const shouldUpdateStart = startDate.isBefore(currentStart);
    // const shouldUpdateEnd = endDate.isAfter(currentEnd);

    // if (shouldUpdateStart && !shouldUpdateEnd) {
    //   const newStartDate = +currentStart - (currentEnd - currentStart) ;


    //   dispatch(setPrimaryMetric({
    //     startDate: newStartDate,
    //     graphStart: startDate.valueOf(),
    //     graphEnd: endDate.valueOf()
    //   }))
    //     .then((res) => dispatch(fetchRegions(res)))
    //     .then((res) => dispatch(fetchRelatedMetricData(res)));

    //   return Promise.resolve();

      // return dispatch(fetchRegions()).then(() => {
      //   return dispatch(fetchRelatedMetricData());
      // });
    // }
  //}
  };
}

function updateAnalysisDates(startDate, endDate) {
  return (dispatch, getState) => {
    dispatch(updateMetricDate(startDate, endDate));
  };
}

function selectMetric(...args) {
  return (dispatch, getState) => {
    const argh = args;
    debugger;
  };
}

function fetchSummaryData() {
  return (dispatch, getState) => {
    dispatch(updateMetricDate(startDate, endDate));
  };
}

function setSummary() {

}

function selectDimension(name) {
  return (dispatch, getState) => {
    debugger;
    dispatch(setSelectedDimension(name));
  };
}

export const Actions = {
  loading,
  requestFail,
  fetchRelatedMetricData,
  fetchRegions,
  setPrimaryMetric,
  updateCompareMode,
  updateMetricDate,
  updateAnalysisDates,
  selectMetric,
  selectDimension
};

