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
    selectedDimension,
    heatmapData
  } = store.dimensions;

  const {
    granularity,
    selectedDimensions
  } = store.primaryMetric;

  const dimensionKeys = Object.keys(timeseries.subDimensionContributionMap || {});

  return {
    keys,
    loading,
    loaded,
    failed,
    subdimensions: dimensionKeys
      .map((key) => {
        const keyName = `${selectedDimension}-${key}`;
        const subDimension = Object.assign({}, dimensions[keyName]);

        if (subDimension && selectedDimensions.includes(keyName)) {
          subDimension.isSelected = true;
        }
        return subDimension;
      }),
    dimensionKeys,
    granularity,
    heatmapData
  };
}

function actions(dispatch) {
  return {
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));

