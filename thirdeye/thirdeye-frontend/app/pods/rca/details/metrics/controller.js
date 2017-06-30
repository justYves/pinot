import Ember from 'ember';

export default Ember.Controller.extend({
  detailsController: Ember.inject.controller('rca/details'),
  splitView: false,
  selectedTab: 'change',

  contributionTableMode: 'change',

  actions: {
    /**
     * Toggles the split View for multimetric graphs
     */
    onSplitViewToggling() {
      this.toggleProperty('splitView');
    },

    /**
     * Handles Contribution Table Tab selection
     * @param {String} tab Name of selected Tab
     */
    onTabChange(tab) {
      const currentTab = this.get('selectedTab');
      if (currentTab !== tab) {
        this.set('selectedTab', tab);
      }
    }
  }
});
