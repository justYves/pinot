import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/anomaly';
import _ from 'lodash';

function select(store) {
  const { 
    entity, 
    loading, 
    loaded, 
    failed,
    primaryMetricId
  } = store.anomaly;

  const {
    loading: metricLoading,
    loaded: metricLoaded,
    failed: metricFailed,
    relatedMetricEntities = {},
    relatedMetricIds,
    regions,
  } = store.metrics;

// TODO: place this in another file
//  if (entity) {
//   entity.isSelected = true;
//  }

  const uiRelatedMetric = _.merge({}, relatedMetricEntities, regions);
  // const relateMetric = relatedMetricEntities
  // HACK FOR TESTING MUST DELETE
  const whiteList = [2132386, 2132385, 2132368, 2132370];
  return {
    loading,
    loaded,
    failed,
    metricLoading,
    metricFailed,
    metricLoaded,
    entity: Object.assign({isSelected: true}, entity),
    primaryMetric: uiRelatedMetric[primaryMetricId],
    relatedMetrics: relatedMetricIds
      .filter((id) => whiteList.contains(id))
      .map(id => uiRelatedMetric[id])
      .filter(metric => {
        return metric;
      })
  };
}

function actions(dispatch) {
  return {
    onLoad() {
      dispatch(Actions.loadAnomaly());
    },
    onLoading() {
      dispatch(Actions.loading());
    },
    onRequest() {
      const params = {};

      dispatch(Actions.request(params));
    },
    onSelection(selection) { 
      debugger;
      // dispatch()
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
