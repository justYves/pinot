import Ember from 'ember';
import fetch from 'fetch';

export default Ember.Route.extend({

  model(params, transition) {
    const {
      'rca.details': detailsParams = {}
    } = transition.params;

    const { metricId = null } = detailsParams;
    if (!metricId) { return; }

    return fetch(`/data/metric/${metricId}`)
      .then(res => res.json());
  },

  setupController(controller, model) {
    this._super(...arguments);

    controller.set('primaryMetric', model);
  }
});
