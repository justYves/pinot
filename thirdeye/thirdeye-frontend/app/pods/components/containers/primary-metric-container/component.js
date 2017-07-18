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
    selectedEvents,
    selectedMetricIds
  } = store.primaryMetric;

  const {
    relatedMetricEntities
  } = store.metrics;

  const {
    dimensions
  } = store.dimensions;

  const {
    events = []
  } = store.events;

  const isSelected = true;

  // to do fix region and put this in reducer
  const uiRelatedMetric = _.merge({}, metricData, regions);

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
        return Object.assign({},
          dimensions[key],
          { isSelected });
      }).filter(dimension => dimension),
    primaryMetric: uiRelatedMetric[primaryMetricId],
    selectedMetrics: selectedMetricIds
      .map((id) => {
        return Object.assign({},
          relatedMetricEntities[id],
          { isSelected });
      }),
    selectedEvents: events
      .filter((event) => {
        return selectedEvents.includes(event.urn);
      }).map((event) => Object.assign({}, event, { isSelected }))
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
    },

    onMetricSelection(metric) {
      dispatch(Actions.selectMetric(metric));
    },

    onDeselect(entity) {
      if (this.get('selectedDimensions').includes(entity)) {
        dispatch(Actions.selectDimension(entity));
      }

      if (_.map(this.get('selectedEvents'), 'urn').includes(entity)) {
        dispatch(Actions.selectEvent(entity));
      }
      if (this.get('selectedMetrics').includes(entity)) {
        dispatch(Actions.selectMetric(entity));
      }
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
