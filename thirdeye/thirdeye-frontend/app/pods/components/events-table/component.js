import Ember from 'ember';

export default Ember.Component.extend({
  columns: [
    {
      'propertyName': 'label',
      'title': 'Event Name'
      // 'templateForFilterCell': '',
    },
    {
      'propertyName': 'type',
      'title': 'Type',
      'filterWithSelect': true
    },
    {
      'template': 'custom/date-cell',
      'title': 'Start Date - End Date'
    },
    {
      'propertyName': 'eventType',
      'title': 'Event Type',
      'filterWithSelect': true
    },
    {
      'propertyName': 'score',
      'title': 'Impact %',
      'disableFiltering': true
    }
  ]
});

