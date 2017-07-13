import { ActionTypes } from '../actions/dimensions';
import moment from 'moment';
/**
 * Define the schema
 */
const INITIAL_STATE = {

  /**
   * State for loading
   */
  loading: false,

  /**
   * State for loaded
   */
  loaded: false,

  /**
   * State for failed request
   */
  failed: false,

  keys: [],
  metricId: null,
  selectedDimension: null,
  timeseries: []
};

export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case ActionTypes.LOAD: {
      const keys = action.payload || [];
      const { metricId } = action;

      return Object.assign(state, {
        keys,
        metricId,
        loading: false,
        loaded: true,
        failed: false
      });
    }

    case ActionTypes.LOADING:
      return Object.assign(state, {
        loading: true,
        loaded: false,
        failed: false
      });

    case ActionTypes.SET: {
      const selectedDimension = action.payload;
      return Object.assign(state, {
        selectedDimension
      });
    }

    case ActionTypes.LOAD_TIMESERIES: {
      const timeseries = action.payload;

      return Object.assign(state, {
        timeseries
      });
    }

    case ActionTypes.REQUEST_FAIL:
      return Object.assign(state, {
        loaded: false,
        loading: false,
        failed: true
      });
  }

  return state;
}
