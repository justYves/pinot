/**
 * Handles logic for app base view
 * @module  application
 * @exports application
 */
import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Global navbar items
   * @type {Array}
   */
  globalNavItems: [
    {
      className: 'anomalies',
      link: '/thirdeye#anomalies',
      isCustomLink: true,
      title: 'Anomalies'
    },
    {
      className: 'rca',
      link: 'rca',
      title: 'Root Cause Analysis',
      isCustomLink: false
    },
    {
      className: 'manage',
      link: 'manage',
      title: 'Manage'
    }
  ],

  actions: {
    onLogout() {
      this.send('logout');
    }
  }
});
