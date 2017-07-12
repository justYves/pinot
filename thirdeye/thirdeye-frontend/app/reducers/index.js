import anomaly from './anomaly';
import metrics from './metrics';
import events from './events';

import { combineReducers } from 'redux';
import primaryMetric from './primary-metric';

export default combineReducers({
  anomaly,
  events,
  metrics,
  primaryMetric
});

