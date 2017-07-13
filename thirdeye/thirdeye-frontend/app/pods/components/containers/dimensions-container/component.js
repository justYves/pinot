import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/dimensions';


function select(store) {
  const {
    keys,
    loading,
    loaded,
    failed,
    timeseries
  } = store.dimensions;

  const {
    granularity,
    analysisStart,
    analysisEnd
  } = store.primaryMetric;

  return {
    keys,
    loading,
    loaded,
    failed,
    timeseries,
    granularity,
    analysisStart,
    analysisEnd
  };
}

function actions(dispatch) {
  return {
    loading() {
      dispatch(Actions.loading());
    },
    load() {
      dispatch(Actions.load());
    },
    fail() {
      dispatch(Actions.requestFail());
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
