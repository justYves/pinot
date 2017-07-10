import Ember from 'ember';

export default Ember.Component.extend({
  events: [],

  allCount: Ember.computed.alias('events.length'),

  holidays: Ember.computed(
    'events.@each',
    function() {
      return this.get('events')
        .filter(event => event.eventType === 'holiday');
    }
  ),
  holidayCount: Ember.computed.alias('holidays.length'),

  gcn: Ember.computed(
    'events.@each',
    function() {
      return this.get('events')
        .filter(event => event.eventType === 'gcn');
    }
  ),
  gcnCount: Ember.computed.alias('gcn.length'),

  informed: Ember.computed(
    'events.@each',
    function() {
      return this.get('events')
        .filter(event => event.eventType === 'informed');
    }
  ),
  informedCount: Ember.computed.alias('informed.length')
});
