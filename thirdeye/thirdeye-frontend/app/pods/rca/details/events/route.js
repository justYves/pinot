import Ember from 'ember';
import moment from 'moment';
import { Actions } from 'thirdeye-frontend/actions/events';

export default Ember.Route.extend({
  redux: Ember.inject.service(),

  /**
   * Massages Query Params from URL and dispatch redux actions
   */
  model(params, transition) {
    if (!params.id) { return; }
    // ideally caught in component
    const { metricId } = transition.params['rca.details'];
    const redux = this.get('redux');

    redux.dispatch(Actions.fetchEvents());
    return {};

  },
  actions: {
    queryParamsDidChange(changeParams, oldParams) {
      this._super(...arguments);

      // const controller = this.get('controller');
      // if (!controller) { return true; }

      const redux = this.get('redux');
      const {
        analysisStart: start,
        analysisEnd: end
      } = Object.assign(oldParams, changeParams);

      redux.dispatch(Actions.updateDates(Number(start), Number(end)));

      // bubbling up
      return true;
    }
  }
});
