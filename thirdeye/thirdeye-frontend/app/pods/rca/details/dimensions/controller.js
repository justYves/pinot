import Ember from 'ember';
import moment from 'moment';

export default Ember.Controller.extend({
  queryParams: ['dimension'],
  dimension: 'All',

  tableIsLoading: false,

  showDetails: false,
  selectedTab: 'details',

  dimensionsStart: null,
  dimensionsEnd: null,
  dateFormat: 'MMM D, YYYY hh:mm a',

  actions: {
    // Sets new dimension start and end
    setNewDate({ start, end }) {
      const dimensionsStart = moment(start).valueOf();
      const dimensionsEnd = moment(end).valueOf();

      this.setProperties({
        dimensionsEnd,
        dimensionsStart
      });
    },

    onRendering() {
      this.set('tableIsLoading', false);
    },

    onToggle(showDetails) {
      this.setProperties({
        showDetails,
        tableIsLoading: true
      });
    },

    /**
     * Handles subchart date change (debounced)
     */
    setDateParams([start, end]) {
      this.set('tableIsLoading', true);
      Ember.run.debounce(this, this.get('actions.setNewDate'), { start, end }, 1000);
    },

    /**
     * Handles Contribution Table Tab selection
     * @param {String} tab Name of selected Tab
     */
    onTabChange(tab) {
      const currentTab = this.get('selectedTab');
      if (currentTab !== tab) {
        Ember.run.later(() => {
          this.setProperties({
            selectedTab: tab
          });
        });
      }
    }
  }

});
