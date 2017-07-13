import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['dimension'],
  dimension: 'All'

});


// /timeseries/compare/194591/1499839200000/1499914800000/1499234400000/1499310000000?dimension=continent&filters={}&granularity=HOURS
