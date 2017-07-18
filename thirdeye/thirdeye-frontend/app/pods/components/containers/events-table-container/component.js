import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/events';


function select(store) {
  const {
    loading,
    loaded,
    events
  } = store.events;

  const {
    selectedEvents = []
  } = store.primaryMetric;

  return {
    loading,
    loaded,
    events: events.map((event) => {
      event = Object.assign({}, event);
      if (selectedEvents.includes(event.urn)) {
        event.isSelected = true;
      }
      return event;
    })
  };
}

function actions(dispatch) {
  return {
    onLoad() {
      // dispatch(Actions.fetchEvents);
    }
  };
}

export default connect(select, actions)(Ember.Component.extend({
}));
