import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions as metricActions } from 'thirdeye-frontend/actions/metrics';
import { Actions as Actions } from 'thirdeye-frontend/actions/primary-metric';
import { task, timeout } from 'ember-concurrency';
import _ from 'lodash';

function select(store) {
  const {
    loading,
    loaded,
    failed,
    relatedMetricEntities = {},
    relatedMetricIds,
    selectedMetricIds,
    regions,
    primaryMetricId,
    compareMode,
    granularity
  } = store.metrics;

  // const uiRelatedMetric = _.merge(relatedMetricEntities, regions);
  const uiRelatedMetric = _.merge({}, relatedMetricEntities, regions);

  // improve this so that it isn't called twice
  return {
    loading,
    loaded,
    failed,
    compareMode,
    granularity,
    selectedMetrics: selectedMetricIds.map(id => uiRelatedMetric[id]),
    primaryMetric: uiRelatedMetric[primaryMetricId],
    relatedMetrics: relatedMetricIds
      .map((id) => {
        const relatedMetric = uiRelatedMetric[id];

        if (selectedMetricIds.includes(id)) {
          relatedMetric.isSelected = true;
        }

        return relatedMetric;
      })
  };
}


function actions(dispatch) {

  return {
    onSelection(metric) {
      dispatch(metricActions.selectMetric(metric));
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
