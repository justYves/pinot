import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
  model(params) {
    const { metricId: id } = params;
    if (!id) { return; }

    return RSVP.hash({
      granularities: fetch(`/data/agg/granularity/metric/${id}`).then(res => res.json()),
      // primaryMetric: fetch(`/data/metric/${id}`).then(res => res.json()),
      // dimension: fetch(`/data/autocomplete/dimensions/metric/${id}`).then(res => res.json()),
      // metricfilters: fetch(`/data/autocomplete/filters/metric/${id}`).then(res => res.json()),
      maxTime: fetch(`/data/maxDataTime/metricId/${id}`).then(res => res.json())
    })
  }
});
