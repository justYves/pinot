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
    relatedMetricEntities: metricData = {},
    regions,
    primaryMetricId,
    compareMode,
    granularity,
    currentStart,
    currentEnd,
    graphStart,
    graphEnd,
    selectedDimensions
  } = store.primaryMetric;

  const {
    selectedMetricIds = [],
    relatedMetricEntities
  } = store.metrics;

  const {
    timeseries
  } = store.dimensions;

  // to do fix region and put this in reducer
  const uiRelatedMetric = _.merge(metricData, regions);

  debugger;

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
    selectedDimensions: selectedDimensions
      .map(key => {
        return Object.assign(
          {name: key},
          timeseries.subDimensionContributionMap[key],
        );
      })
      .filter(dimension => dimension),
    primaryMetric: uiRelatedMetric[primaryMetricId],
    selectedMetrics: selectedMetricIds
      .map(id => relatedMetricEntities[id])
  };
}


function actions(dispatch) {
  return {
    dateChangeTask: task(function* ([start, end]) {
      yield timeout(1000);

      dispatch(Actions.updateAnalysisDates(start, end));
      return [start, end];
    }).restartable(),

    onDateChange(dates) {
      const task = this.get('actions.dateChangeTask');

      return task.perform(dates);
    },

    onSelection(name) {
      debugger;
      dispatch(Actions.selectDimension(name));
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
