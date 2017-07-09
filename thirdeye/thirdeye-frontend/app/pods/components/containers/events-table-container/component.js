import Ember from 'ember';
import { connect } from 'ember-redux';
import { Actions } from 'thirdeye-frontend/actions/events';


function select(store) {
  const {
    loading,
    loaded,
    events
  } = store.events;

  return {
    loading,
    loaded,
    events
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
