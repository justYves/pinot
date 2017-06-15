import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/metrics';
import _ from 'lodash';

function select(store) {
  const {
    loading,
    loaded,
    failed,
    relatedMetricEntities = {},
    relatedMetricIds,
    regions,
    primaryMetricId,
    compareMode,
    granularity,
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
    compareMode,
    granularity,
    // entity: Object.assign({isSelected: true}, e ntity),
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
    updateCompareMode(compareMode) {
      // dispatch(Actions.toggleSplitView(splitView))
    },
    onLoading() {
      // dispatch(Actions.loading());
    },
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
