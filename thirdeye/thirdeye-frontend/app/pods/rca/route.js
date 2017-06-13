import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    debugger;
    const { id } = params;
    return {id};
  }
});


// import Ember from 'ember';
// import { Actions as AnomalyActions } from 'thirdeye-frontend/actions/anomaly';
// import { Actions as MetricsActions } from 'thirdeye-frontend/actions/related-metrics';

// export default Ember.Route.extend({
//   redux: Ember.inject.service(),

//   model(params) {
//     const { id } = params;
//     const redux = this.get('redux');

//     redux.dispatch(AnomalyActions.fetchData(id))
//       .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricIds(res)))
//       .then((res) => redux.dispatch(MetricsActions.fetchRegions(res)))
//       .then((res) => redux.dispatch(MetricsActions.fetchRelatedMetricData(res)))
//     return {};
//   }
// });

