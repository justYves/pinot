import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    const { id } = params;
    return {id};
  }
});
