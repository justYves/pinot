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
    selectedDimensions,
    selectedEvents
  } = store.primaryMetric;

  const {
    selectedMetricIds = [],
    relatedMetricEntities
  } = store.metrics;

  const {
    dimensions
  } = store.dimensions;

  const {
    events = []
  } = store.events;

  // to do fix region and put this in reducer
  const uiRelatedMetric = _.merge(metricData, regions);


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
      .map((key) => {
        return dimensions[key];
      }).filter(dimension => dimension),
    primaryMetric: uiRelatedMetric[primaryMetricId],
    selectedMetrics: selectedMetricIds
      .map(id => relatedMetricEntities[id]),
    selectedEvents: events.filter((event) => {
      return selectedEvents.includes(event.urn);
    })
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
      dispatch(Actions.selectDimension(name));
    },

    onEventSelection(name) {
      dispatch(Actions.selectEvent(name));
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
