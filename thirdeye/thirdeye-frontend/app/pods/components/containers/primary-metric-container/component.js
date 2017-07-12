import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions as metricActions } from 'thirdeye-frontend/actions/primary-metric';
import _ from 'lodash';

function select(store) {
  const {
    loading,
    loaded,
    failed,
    relatedMetricEntities = {},
    regions,
    primaryMetricId,
    compareMode,
    granularity
  } = store.primaryMetric;

  const uiRelatedMetric = _.merge({}, relatedMetricEntities, regions);

  return {
    loading,
    loaded,
    failed,
    compareMode,
    granularity,
    primaryMetric: uiRelatedMetric[primaryMetricId]
  };
}


function actions(dispatch) {
  // let currentTask = null;

  return {
    // dateChangeTask: task(function* ([start, end]) {
    //   yield timeout(1000);
    //   alert(start + '' + end);
    //   dispatch(eventActions.updateDates(start, end));
    // }),
    onDateChange(dates) {
      // currentTask && currentTask.cancel();
      // currentTask = this.get('actions.dateChangeTask').perform(dates);
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
