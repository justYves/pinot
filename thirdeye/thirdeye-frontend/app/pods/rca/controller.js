import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

export default Ember.Controller.extend({
  primaryMetric: [], 
  searchMetrics: task(function* (metric) {
    yield timeout(600);
    let url = `/data/autocomplete/metric?name=${metric}`;
    return fetch(url)
      .then(res => res.json()) 
  }),

  actions: {
    onMetricChange(metric) {
      const { id } = metric;
      if (!id) { return; }
      this.set('primaryMetric', metric);

      this.transitionToRoute('rca.details', id);
      // this.set('metricId', metric.id);
    }
  }
});
