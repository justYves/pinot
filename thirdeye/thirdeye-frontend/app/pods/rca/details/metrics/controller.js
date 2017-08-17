import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

export default Ember.Controller.extend({
  detailsController: Ember.inject.controller('rca/details'),
  splitView: false,
  selectedTab: 'change',

  mostRecentTask: null,
  loading: false,
  splitViewLoading: false,
  dateFormat: 'MMM D, YYYY hh:mm a',

  // Ember concurrency task that sets new analysis start and end
  dateChangeTask: task(function* ([start, end]) {
    yield timeout(600);

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
    // Handles subgraph date change
    onDateChange(date) {
      this.set('loading', true);
      const mostRecentTask = this.get('mostRecentTask');
      mostRecentTask && mostRecentTask.cancel();

      const task = this.get('dateChangeTask');
      const taskInstance = task.perform(date);
      this.set('mostRecentTask', taskInstance);

      return date;
    },

    onRendering() {
      this.set('loading', false);
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
