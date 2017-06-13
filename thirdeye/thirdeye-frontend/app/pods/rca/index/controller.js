import Ember from 'ember';
import fetch from 'fetch';

export default Ember.Controller.extend({
  selection: null,

  _performSearch(metric, resolve, reject) {
    const url = `/data/autocomplete/metric?name=${metric}`;
    return fetch(url)
      .then(res => res.json()) 
      .then(resolve)
      .catch(reject)
  },

  actions: {
    onChange(metric) {
      this.set('selection', metric);
      this.transitionToRoute('rca.metric-id', metric.id);
    },
    onSearch(metric) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run.debounce(this, this._performSearch, metric, resolve, reject, 600);
      });
    }
  }
});
