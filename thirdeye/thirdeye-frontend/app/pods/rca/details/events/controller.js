import Ember from 'ember';

export default Ember.Controller.extend({
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
