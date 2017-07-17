import Ember from 'ember';
import RSVP from 'rsvp';
import moment from 'moment';
import fetch from 'fetch';
import { Actions as MetricsActions } from 'thirdeye-frontend/actions/primary-metric';

const queryParamsConfig = {
  refreshModel: true,
  replace: false
};

export default Ember.Route.extend({
  queryParams: {
    startDate: queryParamsConfig,
    endDate: queryParamsConfig,
    granularity: queryParamsConfig,
    filters: queryParamsConfig,
    compareMode: queryParamsConfig,
    analysisStart: {replace: true},
    analysisEnd: {replace: true}
  },

  redux: Ember.inject.service(),

  beforeModel(transition) {
    if (transition.targetName === 'rca.details.index') {
      this.replaceWith('rca.details.events');
    }
  },

  model(params) {
    alert('resetting model');
    const { metricId: id } = params;
    if (!id) { return; }

    return RSVP.hash({
      granularities: fetch(`/data/agg/granularity/metric/${id}`).then(res => res.json()),
      metricFilters: fetch(`/data/autocomplete/filters/metric/${id}`).then(res => res.json()),
      maxTime: fetch(`/data/maxDataTime/metricId/${id}`).then(res => res.json()),
      id
    });
  },

  afterModel(model, transition) {
    const redux = this.get('redux');
    const maxTime = moment(model.maxTime);
    let start = null;

    const {
      startDate,
      endDate = moment().subtract(1, 'day').endOf('day').valueOf(),
      analysisStart,
      analysisEnd,
      granularity = model.granularities[0],
      filters = JSON.stringify({}),
      compareMode = 'WoW'
    } = transition.queryParams;

    debugger;

    if (granularity === 'DAYS') {
      start = moment().subtract(29, 'days').startOf('day');
    } else {
      start = moment().subtract(24, 'hours').startOf('hour');
    }

    debugger;

    const params = {
      startDate: startDate || start,
      endDate: maxTime.isValid() ? maxTime.valueOf() : endDate,
      granularity: granularity,
      filters,
      id: model.id,
      analysisStart,
      analysisEnd,
      graphStart: analysisStart,
      graphEnd: analysisEnd,
      compareMode
    };
    debugger;

    Object.assign(model, params);

    debugger;

    redux.dispatch(MetricsActions.setPrimaryMetric(params))
      .then((res) => redux.dispatch(MetricsActions.fetchRegions(res)))
      .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricData(res)));

    return {};
  },

  setupController(controller, model) {
    alert('setting controller');

    this._super(controller, model);
    const {
      granularity,
      startDate,
      endDate,
      analysisStart,
      analysisEnd,
      compareMode
    } = model;

    let diff = Math.floor((+endDate - startDate) / 4);
    let initStart = analysisStart || (+startDate + diff);
    let initEnd = analysisEnd || (+endDate - diff);

    controller.setProperties({
      model,
      analysisStart: initStart,
      analysisEnd: initEnd,
      extentStart: initStart,
      extentEnd: initEnd,
      granularity,
      startDate,
      endDate,
      compareMode
    });
  },

  actions: {
    onDateChangeTest(dates) {
      alert('route action');
    },

    willTransition(transition) {
      alert('will transition from details');
      if (transition.targetName === 'rca.index') {
        this.refresh();
      }
    },

    queryParamsDidChange(changedParams, oldParams, removed) {
      // const params = Object.keys(changedParams);

      // if (params.length === 1 && params[0] ==='granularity') {

      //   // removed = {
      //   //   analysisStart: undefined,
      //   //   analysisEnd: undefined,
      //   //   startDate: undefined,
      //   //   endDate: undefined
      //   // };
      // }

      this._super(changedParams, oldParams, removed);

      return true;
    }
  }
});
