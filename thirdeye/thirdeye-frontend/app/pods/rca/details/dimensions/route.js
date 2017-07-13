import Ember from 'ember';
// import moment from 'moment';

import { Actions } from 'thirdeye-frontend/actions/dimensions';

export default Ember.Route.extend({
  redux: Ember.inject.service(),

  queryParams: {
    dimension: {
      replace: true,
      refreshModel: true
    }
  },

  model(params, transition) {
    const redux = this.get('redux');
    const { metricId } = transition.params['rca.details'];
    const {
      dimension = 'All'
    } = transition.queryParams;

    if (!metricId) { return; }
    // /timeseries/compare/${metricId}/${analysisStart}/1499914800000/1499234400000/1499310000000?dimension=continent&filters={}&granularity=HOURS
    Ember.run.later(() => {
      redux.dispatch(Actions.updateDimension(dimension)).then(() => {
        redux.dispatch(Actions.fetchDimensions(metricId));
      });
    });

    return {};
  }
});
