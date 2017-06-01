import Ember from 'ember';
import moment from 'moment';

export function formatDate(params/*, hash*/) {
  const date = params[0];
  const dateFormat = 'M/D hh:mm a';

  return moment(date).format(dateFormat);
}

export default Ember.Helper.helper(formatDate);


/**
 * Displays human readable date
 * @param {string} granularity granularity of the metric
 * @param {string} date A date
 * @return {string} human readable date
 */
