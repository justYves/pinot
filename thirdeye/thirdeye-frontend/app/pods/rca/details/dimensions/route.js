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
    redux.dispatch(Actions.loading());
    Ember.run.later(() => {
      redux.dispatch(Actions.updateDimension(dimension)).then(() => {
        redux.dispatch(Actions.fetchDimensions(metricId));
      });
    });

    return {};
  },

  actions: {
    queryParamsDidChange(params) {
      debugger;
      this._super(...arguments);
      return true;
    //   const redux = this.get('redux');
    //   const {
    //     analysisStart,
    //     analysisEnd,
    //     dimension
    //   } = params;

    //   if (dimension) {
    //     return true;
    //   }


    //   redux.dispatch(Actions.loading());
    //   redux.dispatch(Actions.updateDimension());
    //   return true;
    }
  }
});
