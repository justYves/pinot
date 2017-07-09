import Ember from 'ember';
import RSVP from 'rsvp';
import moment from 'moment';
import fetch from 'fetch';
import { Actions as MetricsActions } from 'thirdeye-frontend/actions/metrics';

const queryParamsConfig = {
  refreshModel: true,
  replace: true
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
    const { queryParams } = transition;

    // console.log('queryParams', queryParams);
    const redux = this.get('redux');
    queryParams.granularity = queryParams.granularity || model.granularities[0];
    const granularity = queryParams.granularity; // || model.granularities[0];
    const id = model.id;
    const maxTime = moment(model.maxTime);
    const filters = queryParams.filters || JSON.stringify({});

    // TODO startDAte based on granularity
    const metricParams = {
      startDate: moment().subtract(1, 'week').endOf('day'),
      endDate: maxTime.isValid() ? maxTime : moment().subtract(1, 'day').endOf('day'),
      granularity,
      filters,
      id
    };

    model.granularity = granularity;
    model.paramFilters = filters;
    model.startDate = metricParams.startDate;
    model.endDate = metricParams.endDate;

    redux.dispatch(MetricsActions.setPrimaryMetric(metricParams))
      .then((res) => redux.dispatch(MetricsActions.fetchRegions(res)))
      .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricData(res)));
    this.replaceWith('rca.details.events');

    return {};
  },

  setupController(controller, model, transition) {
    alert('in setup controller');
    const {
      analysisStart,
      analysisEnd
    } = transition.queryParams;

    const {
      granularity,
      startDate,
      endDate
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
  }
});
