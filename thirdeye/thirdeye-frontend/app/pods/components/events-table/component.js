import Ember from 'ember';

export default Ember.Component.extend({
  events: [],
  selectedTab: 'all',

  start: null,
  end: null,

  filteredEvents: Ember.computed(
    'eventsInRange.@each.type',
    'selectedTab',
    function() {
      const events = this.get('eventsInRange');
      const selectedTab = this.get('selectedTab');

      if (selectedTab === 'all') { return events; }
      return events
        .filter(event => (event.eventType === selectedTab))
        .sortBy('score');
    }
  ),

  eventsInRange: Ember.computed(
    'events',
    'start',
    'end',
    function() {
      const events = this.get('events');
      const start = this.get('start');
      const end = this.get('end');

      if (!(start && end)) { return events; }

      return events.filter((event) => {
        return (event.end && ((event.end > start) && (event.end < end)))
          || ((event.start < end) && (event.start > start));
      });
    }
  ),


  didUpdateAttrs(...args) {
    Ember.run.later(() => {
      this._super(args);
    });
  },

  columns: [
    {
      template: 'custom/checkbox',
      useFilter: false,
      mayBeHidden: false,
      className: 'events-table__column--flush'
    },
    {
      propertyName: 'label',
      title: 'Event Name',
      className: 'events-table__column'
    },
    {
      propertyName: 'eventType',
      title: 'Type',
      filterWithSelect: true,
      sortFilterOptions: true,
      className: 'events-table__column'
    },
    {
      template: 'custom/date-cell',
      title: 'Start Date - End Date',
      className: 'events-table__column'
    }
    // {
    //   propertyName: 'score',
    //   title: 'Score',
    //   disableFiltering: true,
    //   className: 'events-table__column',
    //   sortDirection: 'desc'
    // }
  ],

  actions: {
    onTabChange(tab) {
      const currentTab = this.get('selectedTab');

      if (currentTab !== tab) {
        this.set('selectedTab', tab);
      }
    },

    onSelection(event) {
      this.get('onSelection')(event.urn);
    }
  }
});

