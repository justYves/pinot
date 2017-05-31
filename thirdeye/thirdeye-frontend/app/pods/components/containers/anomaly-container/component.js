import Ember from 'ember';
import connect from 'ember-redux/components/connect';
import { Actions } from 'thirdeye-frontend/actions/anomaly';

function select(store) {
  const { 
    entity, 
    loading, 
    loaded, 
    failed,
    relatedMetricEntities,
    relatedMetricIds } = store.anomaly;

  return {
    loading,
    loaded,
    failed,
    entity,
    relatedMetrics: relatedMetricIds.map(id => relatedMetricEntities[id])
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
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
