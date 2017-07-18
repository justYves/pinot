import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/dimensions';


function select(store) {
  const {
    keys,
    loading,
    loaded,
    failed,
    timeseries,
    dimensions,
    selectedDimension
  } = store.dimensions;

  const {
    granularity
  } = store.primaryMetric;

  const dimensionKeys = Object.keys(timeseries.subDimensionContributionMap || {});

  debugger;

  return {
    keys,
    loading,
    loaded,
    failed,
    // timeseries: dimensionKeys.map(key => {
    //   const dimension = Object.assign({}, dimensionKeys[key], {name: key});

    //   if (!dimension) { return;}
    //   return dimension;
    // }),
    subdimensions: dimensionKeys.map((key) => {
      return dimensions[`${selectedDimension}-${key}`];
    }).filter(dimension => dimension),
    dimensionKeys,
    granularity
  };
}

function actions(dispatch) {
  return {
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));