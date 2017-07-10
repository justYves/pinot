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
        .filter(event => event.type === 'GCN');
    }
  ),
  gcnCount: Ember.computed.alias('gcn.length'),

  informed: Ember.computed(
    'events.@each',
    function() {
      return this.get('events')
        .filter(event => event.type === 'INFORMED');
    }
  ),
  informedCount: Ember.computed.alias('informed.length')
});
