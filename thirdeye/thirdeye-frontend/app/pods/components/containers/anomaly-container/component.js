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
    failed: metricFailed,
    relatedMetricEntities,
    relatedMetricIds,
    regions
  } = store.metrics;

// TODO: place this in another file
//  if (entity) {
//   entity.isSelected = true;
//  }

  const uiRelatedMetric = _.merge({}, relatedMetricEntities, regions);
  // const relateMetric = relatedMetricEntities

  return {
    loading,
    loaded,
    failed,
    metricLoading,
    metricFailed,
    entity: Object.assign({isSelected: true}, entity),
    primaryMetric: [relatedMetricEntities[primaryMetricId]],
    relatedMetrics: relatedMetricIds.map(id => uiRelatedMetric[id]).filter(metric => {
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
      
      // dispatch()
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
