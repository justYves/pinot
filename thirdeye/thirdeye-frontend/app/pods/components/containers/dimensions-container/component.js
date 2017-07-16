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
    granularity

  } = store.primaryMetric;

  return {
    keys,
    loading,
    loaded,
    failed,
    timeseries,
    granularity
  };
}

function actions(dispatch) {
  return {
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
