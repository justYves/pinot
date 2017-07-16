import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/events';


function select(store) {
  const {
    loading,
    loaded,
    events
  } = store.events;

  const {
    primaryMetricId,
    relatedMetricEntities
  } = store.primaryMetric;

  return {
    loading,
    loaded,
    events,
    primaryMetric: relatedMetricEntities[primaryMetricId]
  };
}

function actions(dispatch) {
  return {
    onLoad() {
      // dispatch(Actions.fetchEvents);
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
