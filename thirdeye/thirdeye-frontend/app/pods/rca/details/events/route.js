import Ember from 'ember';
import moment from 'moment';
import { Actions } from 'thirdeye-frontend/actions/events';

export default Ember.Route.extend({
  queryParams: {
    // analysisStart: {replace: true},
    // analysisEnd: {replace: true}
  //   startDate: {
  //     refreshModel: true
  //   },
  //   endDate: {
  //     refreshModel: true
  //   },
  //   granularity: {
  //     refreshModel: true
  //   },
  //   filters: {
  //     refreshModel: true
  //   },
  //   compareMode: {
  //     refreshModel: true
  //   }
  },

  redux: Ember.inject.service(),

  /**
   * Massages Query Params from URL and dispatch redux actions
   */
  model(params, transition) {
    // if (!params.id) { return; }
    // ideally caught in component
    const { metricId } = transition.params['rca.details'];
    const redux = this.get('redux');

    // const defaultQueryParams = {
    //   startDate: moment().subtract(1, 'day').endOf('day'),
    //   endDate: moment().subtract(1, 'week').endOf('day'),
    //   granularity: 'DAYS',
    //   filters: JSON.stringify({}),
    // }
    // const queryParams  = Object.assign(defaultQueryParams, transition.queryParams);
    // const metricParams = Object.assign({}, params, queryParams)

    // return Ember.$.get(`/rootcause/query?framework=relatedEvents&current=1492564800000&baseline=1491960000000&windowSize=28200000&metricUrn=thirdeye:metric:${metricId}`)
    redux.dispatch(Actions.fetchEvents());
    return {};
    //   .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricIds(res)))
    //   .then((res) => redux.dispatch(MetricsActions.fetchRegions(res)))
    //   .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricData(res)))
    //   .catch((error) => redux.dispatch(MetricsActions.requestFail(error)));
  }
});
