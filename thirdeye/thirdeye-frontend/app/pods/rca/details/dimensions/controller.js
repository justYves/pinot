import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['dimension'],
  dimension: 'All',
  tableIsLoading: false,

  splitView: false,
  selectedTab: 'change',

  actions: {
    /**
     * Handles Contribution Table Tab selection
     * @param {String} tab Name of selected Tab
     */
    onTabChange(tab) {
      const currentTab = this.get('selectedTab');
      if (currentTab !== tab) {
        this.set('tableIsLoading', true);

        Ember.run.later(() => {
          this.setProperties({
            selectedTab: tab
          });
        });
      }
    }
  }

});


// /timeseries/compare/194591/1499839200000/1499914800000/1499234400000/1499310000000?dimension=continent&filters={}&granularity=HOURS
