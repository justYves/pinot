/**
 * Component to render pre-set time range selection pills and a 'custom' one using date-range-picker.
 * @module components/range-pill-selectors
 * @property {Object} timeRangeOptions - object containing our range options
 * @property {Number} timePickerIncrement - determines selectable time increment in date-range-picker
 * @property {Date} activeRangeStart - default start date for range picker
 * @property {Date} activeRangeEnd - default end date for range picker
 * @property {String} uiDateFormat - date format specified by parent route (often specific to metric granularity)
 * @property {Action} selectAction - closure action from parent
 * @example
  {{range-pill-selectors
    timeRangeOptions=timeRangeOptions
    timePickerIncrement=5
    maxTime=maxTime
    activeRangeStart=activeRangeStart
    activeRangeEnd=activeRangeEnd
    uiDateFormat=uiDateFormat
    selectAction=(action "onRangeSelection")
  }}
 * NOTE - timeRangeOptions format:
 * [ { name: "3 Months", value: "3m", start: Moment, isActive: true },
 *   { name: "Custom", value: "custom", start: null, isActive: false } ]
 * @exports range-pill-selectors
 * @author smcclung
 */

import Component from '@ember/component';
import moment from 'moment';
import { buildDateEod } from 'thirdeye-frontend/utils/utils';

const RANGE_FORMAT = 'YYYY-MM-DD HH:mm';
const DEFAULT_END_DATE = moment().startOf('day').add(1, 'days');

export default Component.extend({

  classNames: ['range-pill-selectors'],

  /**
   * Properties we expect to receive for the date-range-picker
   */
  maxTime: '',
  timeRangeOptions: '',
  timePickerIncrement: 5,
  activeRangeStart: '',
  activeRangeEnd: '',
  serverFormat: RANGE_FORMAT,

  /**
   * A set of arbitrary time ranges to help user with quick selection in date-time-picker
   */
  predefinedRanges: {
    'Today': [DEFAULT_END_DATE],
    'Last 1 month': [moment().subtract(1, 'months').startOf('day'), DEFAULT_END_DATE],
    'Last 2 months': [moment().subtract(2, 'months').startOf('day'), DEFAULT_END_DATE]
  },

  /**
   * Reset all time range options and activate the selected one
   * @method newTimeRangeOptions
   * @param {String} activeKey - label for currently active time range
   * @return {Array}
   */
  newTimeRangeOptions(activeKey, start, end) {
    const timeRangeOptions = this.get('timeRangeOptions');

    // Generate a fresh new range opitons array - all inactive
    const newOptions = timeRangeOptions.map((range) => {
      const { name, value } = range;
      return {
        name,
        value,
        start,
        end,
        isActive: value === activeKey
      };
    });

    return newOptions;
  },

  actions: {
    /**
     * Invokes the passed selectAction closure action
     */
    selectAction(rangeObj) {
      const action = this.get('selectAction');
      if (action) {
        return action(rangeObj);
      }
    },

    /**
     * User applies a custom date in date-range-picker, which returns start/end.
     * Highlight our 'custom' option and bubble it to the controller's 'selectAction'.
     * @param {String} start - start date
     * @param {String} end - end date
     */
    async onRangeSelection(start, end) {
      const toggledOptions = this.newTimeRangeOptions('custom', start, end);
      const customOption = toggledOptions.find(op => op.value === 'custom');
      this.set('timeRangeOptions', toggledOptions);
      await this.send('selectAction', customOption);
    },

    /**
     * User clicks on a pre-set time range pill link. Highlight link and set active range in date-range-picker.
     * @param {Object} rangeOption - the selected range object
     */
    async onRangeOptionClick(rangeOption) {
      const { value, start, isActive } = rangeOption;
      // Handle as a 'range click' only if inactive and not a custom range
      if (value !== 'custom' && !isActive) {
        // Set date picker defaults to new start/end dates
        this.setProperties({
          activeRangeStart: moment(rangeOption.start).format(RANGE_FORMAT),
          activeRangeEnd: moment(DEFAULT_END_DATE).format(RANGE_FORMAT)
        });
        // Reset options and highlight selected one. Bubble selection to parent controller.
        this.set('timeRangeOptions', this.newTimeRangeOptions(value, start, DEFAULT_END_DATE));
        await this.send('selectAction', rangeOption);
      }
    }
  }
});
