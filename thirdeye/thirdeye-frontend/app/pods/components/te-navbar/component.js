/**
 * Handles the nav bar component logic
 * @module  components/te-navbar
 * @exports anomaly-navbar
 */
import Ember from 'ember';
import config from '../../../config/environment';
import fetch from 'fetch';

export default Ember.Component.extend({

  /**
   * Component's tag name
   */
  tagName: 'nav',

  /**
   * Apply property-based class namete
   */
  classNameBindings: ['navClass'],

  /**
   * List of associated classes
   */
  classNames: ['te-nav'],

  /**
   * App name from environment settings (string)
   */
  webappName: config.appName,

  /**
   * Expanded flag for the help icon
   * @type {boolean}
   */
  isExpanded: false,

  actions: {
    /**
     * Toggles the isExpanded property on click
     */
    onToggleExpanded() {
      this.toggleProperty('isExpanded');
    },

    /**
     * Handler for the log out button
     */
    onLogout() {
      this.send('onToggleExpanded');
      this.attrs.onLogout();
    }
  }
});
