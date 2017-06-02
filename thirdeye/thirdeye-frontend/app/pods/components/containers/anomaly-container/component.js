import Ember from 'ember';
import connect from 'ember-redux/components/connect';
import { Actions } from 'thirdeye-frontend/actions/anomaly';

function select(store) {
  const { 
    entity, 
    loading, 
    loaded, 
    failed,
    primaryMetricId
 } = store.anomaly;

 const {
    relatedMetricEntities,
    relatedMetricIds
 } = store.metrics;

// TODO: place this in another file
//  if (entity) {
//   entity.isSelected = true;
//  }

  return {
    loading,
    loaded,
    failed,
    entity: Object.assign({isSelected: true}, entity),
    primaryMetric: [relatedMetricEntities[primaryMetricId]],
    relatedMetrics: relatedMetricIds.map(id => relatedMetricEntities[id]).filter(metric => {
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
