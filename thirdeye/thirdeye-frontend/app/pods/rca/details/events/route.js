import Ember from 'ember';
import moment from 'moment';
import { Actions } from 'thirdeye-frontend/actions/events';

export default Ember.Route.extend({
  redux: Ember.inject.service(),

  /**
   * Massages Query Params from URL and dispatch redux actions
   */
  model(params, transition) {
    const redux = this.get('redux');
    const { metricId } = transition.params['rca.details'];
    const {
      analysisStart: start,
      analysisEnd: end
    } = transition.queryParams;

    if (!metricId) { return; }


    redux.dispatch(Actions.fetchEvents(Number(start), Number(end)));
    return {};

  },
  actions: {
    queryParamsDidChange(changedParams, oldParams) {
      this._super(...arguments);

      if (!(changedParams.analysisStart
        || changedParams.analysisEnd
        || changedParams.compareMode)) {
        return true;
      }

      const redux = this.get('redux');
      const {
        analysisStart: start,
        analysisEnd: end,
        compareMode
      } = Object.assign(oldParams, changedParams);

      debugger;

      if (!(start && end && compareMode)) {
        return true;
      }
      redux.dispatch(Actions.updateDates(
        Number(start),
        Number(end),
        compareMode
      ));

      // bubbling up
      return true;
    }
  }
});
