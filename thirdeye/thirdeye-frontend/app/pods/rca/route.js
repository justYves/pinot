import Ember from 'ember';
import RSVP from 'rsvp';
import fetch from 'fetch';

export default Ember.Route.extend({
  model(params) {
    const { metricId: id } = params;
    if (!id) { return; }

    return RSVP.hash({
      primaryMetric: fetch(`/data/metric/${id}`).then(res => res.json()),
      granularities: fetch(`/data/agg/granularity/metric/${id}`).then(res => res.json()),
      dimension: fetch(`/data/autocomplete/dimensions/metric/${id}`).then(res => res.json()),
      metricfilters: fetch(`/data/autocomplete/filters/metric/${id}`).then(res => res.json()),
      maxTime: fetch(`/data/maxDataTime/metricId/${id}`).then(res => res.json())
    })
  },

  setupController(controller, hash) {
    controller.set('model', hash);
    
    if (hash.granularity) {
      const granularity = hash.granularity[0];
      controller.set('granularity', granularity)
    }
  }
});
