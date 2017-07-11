import Ember from 'ember';

export default Ember.Component.extend({
  events: [],
  selectedTab: 'all',

  filteredEvents: Ember.computed(
    'events.@each.type',
    'selectedTab',
    function() {
      const events = this.get('events');
      const selectedTab = this.get('selectedTab');

      if (selectedTab === 'all') { return events; }
      return events
        .filter(event => (event.eventType === selectedTab))
        .sortBy('score');
    }
  ),

  didUpdateAttrs(...args) {
    Ember.run.later(() => {
      this._super(args);
    });
  },

  columns: [
    {
      propertyName: 'label',
      title: 'Event Name',
      className: 'events-table__column'
    },
    {
      propertyName: 'eventType',
      title: 'Type',
      filterWithSelect: true,
      className: 'events-table__column'
    },
    {
      template: 'custom/date-cell',
      title: 'Start Date - End Date',
      className: 'events-table__column'
    },
    {
      propertyName: 'score',
      title: 'Score',
      disableFiltering: true,
      className: 'events-table__column',
      sortDirection: 'desc'
    }
  ],

  actions: {
    onTabChange(tab) {
      const currentTab = this.get('selectedTab');

      if (currentTab !== tab) {
        this.set('selectedTab', tab);
      }
    }
  }
});

