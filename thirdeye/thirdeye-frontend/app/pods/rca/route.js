import Route from '@ember/routing/route';
import fetch from 'fetch';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params, transition) {
    const {
      'rca.details': detailsParams = {}
    } = transition.params;

    const { metric_id = null } = detailsParams;

    if (!metric_id) { return {}; }

    return fetch(`/data/metric/${metric_id}`)
      .then(res => res.json());
  },

  setupController(controller, model) {
    this._super(...arguments);

    // clears the controller's primaryMetric
    if (!Object.keys(model).length) {
      controller.set('primaryMetric', null);
    }
  },

  actions: {
    transitionToDetails(id) {
      this.transitionTo('rca.details', id, { queryParams: {
        startDate: undefined,
        endDate: undefined,
        analysisStart: undefined,
        analysisEnd: undefined,
        granularity: undefined,
        filters: JSON.stringify({}),
        compareMode: 'WoW'
      }});
    }
  }
});
