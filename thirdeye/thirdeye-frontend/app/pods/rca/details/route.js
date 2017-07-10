import Ember from 'ember';
import RSVP from 'rsvp';
import moment from 'moment';
import fetch from 'fetch';
import { Actions as MetricsActions } from 'thirdeye-frontend/actions/metrics';

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
    analysisStart: {replace: true},
    analysisEnd: {replace: true},
    compareMode: {
      refreshModel: true
    }
  },

  redux: Ember.inject.service(),

  model(params) {
    debugger;
    const { metricId: id } = params;
    if (!id) { return; }

    return RSVP.hash({
      granularities: fetch(`/data/agg/granularity/metric/${id}`).then(res => res.json()),
      // primaryMetric: fetch(`/data/metric/${id}`).then(res => res.json()),
      // dimension: fetch(`/data/autocomplete/dimensions/metric/${id}`).then(res => res.json()),
      metricFilters: fetch(`/data/autocomplete/filters/metric/${id}`).then(res => res.json()),
      maxTime: fetch(`/data/maxDataTime/metricId/${id}`).then(res => res.json()),
      id
    });
  },
  afterModel(model, transition) {
    const redux = this.get('redux');
    const maxTime = moment(model.maxTime);
    const {
      startDate = moment().subtract(1, 'week').endOf('day').valueOf(),
      endDate = moment().subtract(1, 'day').endOf('day').valueOf(),
      analysisStart,
      analysisEnd,
      granularity,
      filters = JSON.stringify({})
    } = transition.queryParams;

    // TODO startDAte based on granularity
    const params = {
      startDate,
      endDate: maxTime.isValid() ? maxTime : endDate,
      granularity: granularity || model.granularities[0],
      filters,
      id: model.id,
      analysisStart,
      analysisEnd
    };

    Object.assign(model, params);

    redux.dispatch(MetricsActions.setPrimaryMetric(params))
      .then((res) => redux.dispatch(MetricsActions.fetchRegions(res)))
      .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricData(res)));

    debugger;

    if (transition.targetName === 'rca.details.index') {
      this.replaceWith('rca.details.events');
    }

    return {};
  },

  setupController(controller, model, transition) {
    // const {
    //   analysisStart,
    //   analysisEnd
    // } = transition.queryParams;

    const {
      granularity,
      startDate,
      endDate,
      analysisStart,
      analysisEnd
    } = model;

    controller.setProperties({
      model,
      analysisStart,
      analysisEnd,
      extentStart: analysisStart,
      extentEnd: analysisEnd,
      granularity,
      startDate,
      endDate
    });
  },

  resetController() {
    this._super(...arguments);

    alert('in resetController');
  }
});
