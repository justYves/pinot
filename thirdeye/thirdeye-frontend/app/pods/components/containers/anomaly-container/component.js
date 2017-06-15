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

  const uiRelatedMetric = _.merge({}, relatedMetricEntities, regions);

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
      // .filter((id) => whiteList.contains(id))
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
