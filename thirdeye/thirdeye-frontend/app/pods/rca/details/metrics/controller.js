import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

export default Ember.Controller.extend({
  detailsController: Ember.inject.controller('rca/details'),
  splitView: false,
  selectedTab: 'change',
  contributionTableMode: 'change',

  mostRecentTask: null,
  loading: false,

  dateChangeTask: task(function* ([start, end]) {
    yield timeout(600);

    this.set('loading', true);
    let startDate = moment(start).valueOf();
    let endDate = moment(end).valueOf();

    Ember.run.later(() => {
      this.setProperties({
        analysisStart: startDate,
        analysisEnd: endDate
      });
    });
  }),

  actions: {
    /**
     * Toggles the split View for multimetric graphs
     */
    onSplitViewToggling() {
      this.toggleProperty('splitView');
    },

    onDateChange(date) {
      const mostRecentTask = this.get('mostRecentTask');
      mostRecentTask && mostRecentTask.cancel();

      const task = this.get('dateChangeTask');
      const taskInstance = task.perform(date);
      this.set('mostRecentTask', taskInstance);

      return date;
    },

    /**
     * Handles Contribution Table Tab selection
     * @param {String} tab Name of selected Tab
     */
    onTabChange(tab) {
      const currentTab = this.get('selectedTab');
      if (currentTab !== tab) {
        this.set('loading', true);

        Ember.run.later(() => {
          this.setProperties({
            selectedTab: tab
          });
        });
      }
    }
  }
});
