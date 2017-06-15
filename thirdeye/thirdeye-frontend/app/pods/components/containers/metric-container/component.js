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

  const colors = ['orange', 'teal', 'purple', 'red', 'green', 'pink'];
  const assignColor = (elem, index) => {
    elem.color = colors[index % colors.length];
    return elem;
  };

  const uiRelatedMetric = _.merge({}, relatedMetricEntities, regions);
  // HACK FOR TESTING MUST DELETE
  const whiteList = [2132386, 2132385, 2132368, 2132370];
  return {
    loading,
    loaded,
    failed,
    compareMode,
    granularity,
    primaryMetric: uiRelatedMetric[primaryMetricId],
    relatedMetrics: relatedMetricIds
      // .filter((id) => whiteList.contains(id))
      .map(id => {
        return uiRelatedMetric[id]
      })
      .filter(metric => metric)
      .map(assignColor)
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
