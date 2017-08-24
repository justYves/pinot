import Ember from 'ember';

export default Ember.Route.extend({
  moment: Ember.inject.service(),
  beforeModel() {
    this.get('moment').setTimeZone('America/Los_Angeles');
  },
  actions: {
    logout() {
      const url = '/auth/logout';

      fetch(url).then(() => {
        this.transitionTo('login');
      });
    }
  }
});
