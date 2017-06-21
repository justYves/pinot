import Ember from 'ember';
import RSVP from 'rsvp';
import moment from 'moment';
import { Actions as MetricsActions } from 'thirdeye-frontend/actions/metrics';

export default Ember.Route.extend({
  redux: Ember.inject.service(),
  model(params) {
    const { metricId: id } = params;
    if (!id) { return; }

    return RSVP.hash({
      granularities: fetch(`/data/agg/granularity/metric/${id}`).then(res => res.json()),
      // primaryMetric: fetch(`/data/metric/${id}`).then(res => res.json()),
      // dimension: fetch(`/data/autocomplete/dimensions/metric/${id}`).then(res => res.json()),
      // metricfilters: fetch(`/data/autocomplete/filters/metric/${id}`).then(res => res.json()),
      maxTime: fetch(`/data/maxDataTime/metricId/${id}`).then(res => res.json()),
      id
    })
  },
  afterModel(model) {
    const redux = this.get('redux');
    const granularity = model.granularities[0] || 'DAYS';
    const id = model.id;
    const maxTime = moment(model.maxTime);


    // TODO startDAte based on granularity
    const metricParams = {
      startDate: moment().subtract(1, 'week').endOf('day'),
      endDate: maxTime.isValid() ? maxTime : moment().subtract(1, 'day').endOf('day'),
      granularity: granularity,
      filters: JSON.stringify({}),
      id
    }

    // const queryParams  = Object.assign(defaultQueryParams, transition.queryParams);
    // const metricParams = Object.assign({}, params, queryParams)

    redux.dispatch(MetricsActions.setPrimaryMetric(metricParams))
      .then((res) => redux.dispatch(MetricsActions.fetchRegions(res)))
      .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricData(res)))
    return {};
  }
});
