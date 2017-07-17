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


  // setupController: function(controller, model) {
  //   this._super(controller, model);


  //   controller.set('model', this.modelFor('rca.details'));
  // },

  actions: {
    queryParamsDidChange(changedParams, oldParams) {

      const redux = this.get('redux');
      const {
        analysisStart: start,
        analysisEnd: end
      } = changedParams;
      const params = Object.keys(changedParams || {});


      debugger;

      if (params.length === 2 && start && end) {
        Ember.run.later(() => {
          redux.dispatch(Actions.updateDates(
            Number(start),
            Number(end)
          ));
        });
      }
      this._super(...arguments);

      // if (!(changedParams.analysisStart
      //   || changedParams.analysisEnd
      //   || changedParams.compareMode)) {
      //   return true;
      // }

      // const {
      //   analysisStart: start,
      //   analysisEnd: end,
      //   compareMode
      // } = Object.assign(oldParams, changedParams);

      // if (!(start && end && compareMode)) {
      //   return true;
      // }


      // bubbling up
      return true;
    }
  }
});
