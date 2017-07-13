import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/primary-metric';
import _ from 'lodash';
import { task, timeout } from 'ember-concurrency';

function select(store) {
  const {
    loading,
    loaded,
    failed,
    relatedMetricEntities = {},
    regions,
    primaryMetricId,
    compareMode,
    granularity,
    currentStart,
    currentEnd,
    graphStart,
    graphEnd
  } = store.primaryMetric;

  // to do fix region and put this in reducer
  const uiRelatedMetric = _.merge(relatedMetricEntities, regions);

  return {
    loading,
    loaded,
    failed,
    compareMode,
    granularity,
    currentStart,
    currentEnd,
    graphStart,
    graphEnd,
    primaryMetric: uiRelatedMetric[primaryMetricId]
  };
}


function actions(dispatch) {
  let currentTask = null;

  return {
    dateChangeTask: task(function* ([start, end]) {
      yield timeout(1000);

      alert(start + '' + end);
      alert('dispatching on date change');
      dispatch(Actions.updateAnalysisDates(start, end));

      return [start, end];
    }),
    onDateChange(dates) {
      currentTask && currentTask.cancel();

      const task = this.get('actions.dateChangeTask');

      currentTask = task.perform(dates);

      return currentTask;
      // dispatch(Actions.updateDate(dates));
      // dispatch(Actions.loading());
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
