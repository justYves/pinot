/**
 * Controller for Alert Details Page: Overview Tab
 * @module manage/alert/explore
 * @exports manage/alert/explore
 */
import _ from 'lodash';
import fetch from 'fetch';
import moment from 'moment';
import { later } from "@ember/runloop";
import { isPresent } from "@ember/utils";
import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import {
  computed,
  set,
  setProperties,
  getWithDefault
} from '@ember/object';
import {
  checkStatus,
  postProps,
  buildDateEod
} from 'thirdeye-frontend/utils/utils';
import {
  buildAnomalyStats,
  extractSeverity,
  setDuration
} from 'thirdeye-frontend/utils/manage-alert-utils';
import floatToPercent from 'thirdeye-frontend/utils/float-to-percent';
import * as anomalyUtil from 'thirdeye-frontend/utils/anomaly';

export default Controller.extend({
  /**
   * Be ready to receive time span for anomalies via query params
   */
  queryParams: ['duration', 'startDate', 'endDate', 'repRunStatus'],
  duration: null,
  startDate: null,
  endDate: null,
  repRunStatus: null,

  /**
   * Mapping anomaly table column names to corresponding prop keys
   */
  sortMap: {
    start: 'anomalyStart',
    score: 'severityScore',
    change: 'changeRate',
    resolution: 'anomalyFeedback'
  },

  /**
   * Date format for date range picker
   */
  serverDateFormat: 'YYYY-MM-DD HH:mm',

  /**
   * Set initial view values
   * @method initialize
   * @param {Boolean} isReplayNeeded
   * @return {undefined}
   */
  initialize() {
    const repRunStatus = this.get('repRunStatus');
    this.setProperties({
      filters: {},
      loadedWowData: [],
      predefinedRanges: {},
      missingAnomalyProps: {},
      selectedSortMode: '',
      replayErrorMailtoStr: '',
      selectedTimeRange: '',
      selectedFilters: JSON.stringify({}),
      timePickerIncrement: 5,
      openReportModal: false,
      isAlertReady: false,
      isGraphReady: false,
      isReportSuccess: false,
      isReportFailure: false,
      isPageLoadFailure: false,
      isAnomalyArrayChanged: false,
      sortColumnStartUp: false,
      sortColumnScoreUp: false,
      sortColumnChangeUp: false,
      isFetchingDimensions: false,
      isDimensionFetchDone: false,
      sortColumnResolutionUp: false,
      checkReplayInterval: 2000, // 2 seconds
      selectedDimension: 'All Dimensions',
      selectedResolution: 'All Resolutions',
      currentPage: 1,
      pageSize: 10
    });

    // Start checking for replay to end if a jobId is present
    if (this.get('isReplayPending')) {
      this.set('replayStartTime', moment());
      this.get('checkReplayStatus').perform(this.get('jobId'));
    }

    // If a replay is still running, reload when done
    if (repRunStatus) {
      this.get('checkForNewAnomalies').perform(repRunStatus);
    }
  },

  /**
   * Table pagination: number of pages to display
   * @type {Number}
   */
  paginationSize: computed(
    'pagesNum',
    'pageSize',
    function() {
      const { pagesNum, pageSize } = this.getProperties('pagesNum', 'pageSize');
      return Math.min(pagesNum, pageSize/2);
    }
  ),

  /**
   * Table pagination: total Number of pages to display
   * @type {Number}
   */
  pagesNum: computed(
    'filteredAnomalies',
    'pageSize',
    function() {
      const { filteredAnomalies, pageSize } = this.getProperties('filteredAnomalies', 'pageSize');
      const anomalyCount = filteredAnomalies.length || 0;
      return Math.ceil(anomalyCount/pageSize);
    }
  ),

  /**
   * Table pagination: creates the page Array for view
   * @type {Array}
   */
  viewPages: computed(
    'pages',
    'currentPage',
    'paginationSize',
    'pagesNum',
    function() {
      const {
        currentPage,
        pagesNum: max,
        paginationSize: size
      } = this.getProperties('currentPage', 'pagesNum', 'paginationSize');
      const step = Math.floor(size / 2);

      if (max === 1) { return; }

      const startingNumber = ((max - currentPage) < step)
        ? Math.max(max - size + 1, 1)
        : Math.max(currentPage - step, 1);

      return [...new Array(size)].map((page, index) => startingNumber + index);
    }
  ),

  /**
   * Table pagination: pre-filtered and sorted anomalies with pagination
   * @type {Array}
   */
  paginatedFilteredAnomalies: computed(
    'filteredAnomalies.@each',
    'pageSize',
    'currentPage',
    'loadedWoWData',
    'selectedSortMode',
    function() {
      let anomalies = this.get('filteredAnomalies');
      const { pageSize, currentPage, selectedSortMode } = this.getProperties('pageSize', 'currentPage', 'selectedSortMode');

      if (selectedSortMode) {
        let [ sortKey, sortDir ] = selectedSortMode.split(':');

        if (sortDir === 'up') {
          anomalies = anomalies.sortBy(this.get('sortMap')[sortKey]);
        } else {
          anomalies = anomalies.sortBy(this.get('sortMap')[sortKey]).reverse();
        }
      }

      return anomalies.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }
  ),

  /**
   * date-time-picker: indicates the date format to be used based on granularity
   * @type {String}
   */
  uiDateFormat: computed('alertData.windowUnit', function() {
    const granularity = this.get('alertData.windowUnit').toLowerCase();

    switch(granularity) {
      case 'days':
        return 'MMM D, YYYY';
      case 'hours':
        return 'MMM D, YYYY h a';
      default:
        return 'MMM D, YYYY hh:mm a';
    }
  }),

  /**
   * Data needed to render the stats 'cards' above the anomaly graph for this alert
   * @type {Object}
   */
  anomalyStats: computed(
    'alertData',
    'alertEvalMetrics',
    'alertEvalMetrics.projected',
    function() {
      const {
        alertData,
        alertEvalMetrics,
        DEFAULT_SEVERITY: defaultSeverity
      } = this.getProperties('alertData', 'alertEvalMetrics', 'DEFAULT_SEVERITY');
      const features = getWithDefault(alertData, 'alertFilter.features', null);
      const mttdStr = _.has(alertData, 'alertFilter.mttd') ? alertData.alertFilter.mttd.split(';') : null;
      const severityUnitFeatures = (features && features.split(',')[1] !== 'deviation') ? '%' : '';
      const severityUnit = (!mttdStr || mttdStr && mttdStr[1].split('=')[0] !== 'deviation') ? '%' : '';
      const mttdWeight = Number(extractSeverity(alertData, defaultSeverity));
      const convertedWeight = severityUnit === '%' ? mttdWeight * 100 : mttdWeight;
      const statsCards = [
        {
          title: 'Number of anomalies',
          key: 'totalAlerts',
          tooltip: false,
          hideProjected: false,
          text: 'Actual number of alerts sent'
        },
        {
          title: 'Review Rate',
          key: 'responseRate',
          units: '%',
          tooltip: false,
          hideProjected: true,
          text: '% of anomalies that are reviewed.'
        },
        {
          title: 'Precision',
          key: 'precision',
          units: '%',
          tooltip: false,
          text: '% of true anomalies among alerted anomalies.'
        },
        {
          title: 'Recall',
          key: 'recall',
          units: '%',
          tooltip: false,
          text: '% of true alerted anomalies among the total true anomalies.'
        },
        {
          title: `MTTD for > ${convertedWeight}${severityUnit} change`,
          key: 'mttd',
          units: 'hrs',
          tooltip: false,
          hideProjected: true,
          text: `Minimum time to detect for anomalies with > ${convertedWeight}${severityUnit} change`
        }
      ];

      return buildAnomalyStats(alertEvalMetrics, statsCards, true);
    }
  ),

  /**
   * If user selects a dimension from the dropdown, we filter the anomaly results here.
   * NOTE: this is currently set up to support single-dimension filters
   * @type {Object}
   */
  filteredAnomalies: computed(
    'selectedDimension',
    'selectedResolution',
    'anomalyData',
    'anomaliesLoaded',
    function() {
      const {
        anomaliesLoaded,
        selectedDimension: targetDimension,
        selectedResolution: targetResolution
      } = this.getProperties('selectedDimension', 'selectedResolution', 'anomaliesLoaded');
      let anomalies = [];

      if (anomaliesLoaded) {
        anomalies = this.get('anomalyData');
        if (targetDimension !== 'All Dimensions') {
          // Filter for selected dimension
          anomalies = anomalies.filter(data => targetDimension === data.dimensionString);
        }
        if (targetResolution !== 'All Resolutions') {
          // Filter for selected resolution
          anomalies = anomalies.filter(data => targetResolution === data.anomalyFeedback);
        }
        // Add an index number to each row
        anomalies.forEach((anomaly, index) => {
          anomaly.index = index + 1;
        });
      }
      return anomalies;
    }
  ),

  /**
   * Find the active baseline option name
   * @type {String}
   */
  baselineTitle: computed(
    'baselineOptions',
    function() {
      const activeOpName = this.get('baselineOptions').filter(item => item.isActive)[0].name;
      const displayName = `Current/${activeOpName}`;
      return displayName;
    }
  ),

  /**
   * Generate date range selection options if needed
   * @method renderDate
   * @param {Number} range - number of days (duration)
   * @return {String}
   */
  renderDate(range) {
    // TODO: enable single day range
    const newDate = buildDateEod(range, 'days').format("DD MM YYY");
    return `Last ${range} Days (${newDate} to Today)`;
  },

  /**
   * Concurrency task to ping the job-info endpoint to check status of an ongoing replay job.
   * If there is no progress after a set time, we display an error message.
   * @param {Number} jobId - the id for the newly triggered replay job
   * @return {undefined}
   */
  checkReplayStatus: task(function * (jobId) {
    yield timeout(2000);

    const {
      alertId,
      replayStartTime,
      checkReplayInterval
    } = this.getProperties('alertId', 'replayStartTime', 'checkReplayInterval');
    const replayStatusList = ['completed', 'failed', 'timeout'];
    const checkStatusUrl = `/detection-onboard/get-status?jobId=${jobId}`;
    let isReplayTimeUp = Number(moment.duration(moment().diff(replayStartTime)).asSeconds().toFixed(0)) > 60;

    // In replay status check, continue to display "pending" banner unless we have known success or failure.
    fetch(checkStatusUrl).then(checkStatus)
      .then((jobStatus) => {
        const replayStatusObj = _.has(jobStatus, 'taskStatuses')
          ? jobStatus.taskStatuses.find(status => status.taskName === 'FunctionReplay')
          : null;
        const replayStatus = replayStatusObj ? replayStatusObj.taskStatus.toLowerCase() : '';
        // When either replay is no longer pending or 60 seconds have passed, transition to full alert page.
        if (replayStatusList.includes(replayStatus) || isReplayTimeUp) {
          const repRunStatus = replayStatus === 'running' ? jobId : null;
          // Replay may be complete. Give server time to load anomalies
          later(this, function() {
            this.transitionToRoute('manage.alert', alertId, { queryParams: { jobId: null, repRunStatus }});
          }, 3000);
        } else {
          this.get('checkReplayStatus').perform(jobId);
        }
      })
      .catch(() => {
        // If we have job status failure, go ahead and transition to full alert page.
        this.transitionToRoute('manage.alert', alertId, { queryParams: { jobId: null }});
      });
  }),

  /**
   * Concurrency task to reload page once a running replay is complete
   * @param {Number} jobId - the id for the newly triggered replay job
   * @return {undefined}
   */
  checkForNewAnomalies: task(function * (jobId) {
    yield timeout(5000);

    // In replay status check, continue to display "pending" banner unless we have known success or failure.
    fetch(`/detection-onboard/get-status?jobId=${jobId}`).then(checkStatus)
      .then((jobStatus) => {
        const replayStatusObj = _.has(jobStatus, 'taskStatuses')
          ? jobStatus.taskStatuses.find(status => status.taskName === 'FunctionReplay')
          : null;
        if (replayStatusObj) {
          if (replayStatusObj.taskStatus.toLowerCase() === 'completed') {
            this.transitionToRoute({ queryParams: { repRunStatus: null }});
          } else {
            this.get('checkForNewAnomalies').perform(jobId);
          }
        }
      })
      .catch(() => {
        // If we have job status failure, go ahead and transition to full alert page.
        this.transitionToRoute('manage.alert', this.get('alertId'), { queryParams: { repRunStatus: null }});
      });
  }),

  /**
   * Send a POST request to the report anomaly API (2-step process)
   * http://go/te-ss-alert-flow-api
   * @method reportAnomaly
   * @param {String} id - The alert id
   * @param {Object} data - The input values from 'report new anomaly' modal
   * @return {Promise}
   */
  reportAnomaly(id, data) {
    const reportUrl = `/anomalies/reportAnomaly/${id}?`;
    const updateUrl = `/anomalies/updateFeedbackRange/${data.startTime}/${data.endTime}/${id}?feedbackType=${data.feedbackType}`;
    const requiredProps = ['data.startTime', 'data.endTime', 'data.feedbackType'];
    const missingData = !requiredProps.every(prop => isPresent(prop));
    let queryStringUrl = reportUrl;

    if (missingData) {
      return Promise.reject(new Error('missing data'));
    } else {
      Object.entries(data).forEach(([key, value]) => {
        queryStringUrl += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
      // Step 1: Report the anomaly
      return fetch(queryStringUrl, postProps('')).then((res) => checkStatus(res, 'post'))
        .then((saveResult) => {
          // Step 2: Automatically update anomaly feedback in that range
          return fetch(updateUrl, postProps('')).then((res) => checkStatus(res, 'post'));
        });
    }
  },

  /**
   * When exiting route, lets kill the replay status check calls
   * @method clearAll
   * @return {undefined}
   */
  clearAll() {
    this.setProperties({
      activeRangeStart: '',
      activeRangeEnd: '',
      alertEvalMetrics: {}
    });
    // Cancel controller concurrency tasks
    this.get('checkReplayStatus').cancelAll();
    this.get('checkForNewAnomalies').cancelAll();
  },

  /**
   * Actions for alert page
   */
  actions: {

    /**
     * Handle selected dimension filter
     * @method onSelectDimension
     * @param {Object} selectedObj - the user-selected dimension to filter by
     */
    onSelectDimension(selectedObj) {
      this.set('selectedDimension', selectedObj);
      // Select graph dimensions based on filter
      this.get('topDimensions').forEach((dimension) => {
        const isAllSelected = selectedObj === 'All Dimensions';
        const isActive = selectedObj.includes(dimension.name) || isAllSelected;
        set(dimension, 'isSelected', isActive);
      });
    },

    /**
     * Handle selected resolution filter
     * @method onSelectResolution
     * @param {Object} selectedObj - the user-selected resolution to filter by
     */
    onSelectResolution(selectedObj) {
      this.set('selectedResolution', selectedObj);
    },

    /**
     * Handle dynamically saving anomaly feedback responses
     * @method onChangeAnomalyResponse
     * @param {Object} anomalyRecord - the anomaly being responded to
     * @param {String} selectedResponse - user-selected anomaly feedback option
     * @param {Object} inputObj - the selection object
     */
     onChangeAnomalyResponse: async function(anomalyRecord, selectedResponse, inputObj) {
      const responseObj = anomalyUtil.anomalyResponseObj.find(res => res.name === selectedResponse);
      set(inputObj, 'selected', selectedResponse);
      let res;
      try {
        // Save anomaly feedback
        res = await anomalyUtil.updateAnomalyFeedback(anomalyRecord.anomalyId, responseObj.value)
        // We make a call to ensure our new response got saved
        res = await anomalyUtil.verifyAnomalyFeedback(anomalyRecord.anomalyId, responseObj.status)
        const filterMap = getWithDefault(res, 'searchFilters.statusFilterMap', null);
        if (filterMap && filterMap.hasOwnProperty(responseObj.status)) {
          setProperties(anomalyRecord, {
            anomalyFeedback: selectedResponse,
            showResponseSaved: true
          });
        } else {
          return Promise.reject(new Error('Response not saved'));
        }
      } catch (err) {
        setProperties(anomalyRecord, {
          showResponseFailed: true,
          showResponseSaved: false
        });
      }
    },

    /**
     * Action handler for page clicks
     * @param {Number|String} page
     */
    onPaginationClick(page) {
      let newPage = page;
      let currentPage = this.get('currentPage');

      switch (page) {
        case 'previous':
          newPage = --currentPage;
          break;
        case 'next':
          newPage = ++currentPage;
          break;
      }

      this.set('currentPage', newPage);
    },

    /**
     * Handle submission of missing anomaly form from alert-report-modal
     */
    onSave() {
      const { alertId, missingAnomalyProps } = this.getProperties('alertId', 'missingAnomalyProps');
      this.reportAnomaly(alertId, missingAnomalyProps)
        .then((result) => {
          const rangeFormat = 'YYYY-MM-DD HH:mm';
          const startStr = moment(missingAnomalyProps.startTime).format(rangeFormat);
          const endStr = moment(missingAnomalyProps.endTime).format(rangeFormat);
          this.setProperties({
            isReportSuccess: true,
            reportedRange: `${startStr} - ${endStr}`
          });
          // Reload after save confirmation
          later(this, function() {
            this.send('refreshModel');
          }, 1000);
        })
        // If failure, leave modal open and report
        .catch((err) => {
          this.setProperties({
            missingAnomalyProps: {},
            isReportFailure: true
          });
        });
    },

    /**
     * Handle missing anomaly modal cancel
     */
    onCancel() {
      this.setProperties({
        isReportSuccess: false,
        isReportFailure: false,
        renderModalContent: false
      });
    },

    /**
     * Open modal for missing anomalies
     */
    onClickReportAnomaly() {
      this.setProperties({
        isReportSuccess: false,
        isReportFailure: false,
        openReportModal: true
      });
      // We need the C3/D3 graph to render after its containing parent elements are rendered
      // in order to avoid strange overflow effects.
      later(() => {
        this.set('renderModalContent', true);
      });
    },

    /**
     * Received bubbled-up action from modal
     * @param {Object} all input field values
     */
    onInputMissingAnomaly(inputObj) {
      this.set('missingAnomalyProps', inputObj);
    },

    /**
     * Handle display of selected baseline options
     * @param {Object} wowObj - the baseline selection
     */
    onBaselineOptionClick(wowObj) {
      const { anomalyData, baselineOptions } = this.getProperties('anomalyData', 'baselineOptions');
      const isValidSelection = !wowObj.isActive;
      let newOptions = baselineOptions.map((val) => {
        return { name: val.name, isActive: false };
      });

      // Set active option
      newOptions.find((val) => val.name === wowObj.name).isActive = true;
      this.set('baselineOptions', newOptions);

      // Set new values for each anomaly
      if (isValidSelection) {
        anomalyData.forEach((anomaly) => {
          const wow = anomaly.wowData;
          const wowDetails = wow.compareResults.find(res => res.compareMode.toLowerCase() === wowObj.name.toLowerCase());
          let curr = anomaly.current;
          let base = anomaly.baseline;
          let change = anomaly.changeRate;

          if (wowDetails) {
            curr = wow.currentVal.toFixed(2);
            base = wowDetails.baselineValue.toFixed(2);
            change = floatToPercent(wowDetails.change);
          }

          // Set displayed value properties. Note: ensure no CP watching these props
          setProperties(anomaly, {
            shownCurrent: curr,
            shownBaseline: base,
            shownChangeRate: change
          });
        });
      }
    },

    /**
     * Sets the new custom date range for anomaly coverage
     * @method onRangeSelection
     * @param {Object} rangeOption - the user-selected time range to load
     */
    onRangeSelection(rangeOption) {
      const {
        start,
        end,
        value: duration
      } = rangeOption;
      const startDate = moment(start).valueOf();
      const endDate = moment(end).valueOf();
      // Cache the new time range and update page with it
      setDuration(duration, startDate, endDate);
      this.transitionToRoute({ queryParams: { duration, startDate, endDate }});
    },


    /**
     * Load tuning sub-route and properly toggle alert nav button
     */
    onClickTuneSensitivity() {
      this.send('updateParentLink');
      const { duration, startDate, endDate } = this.model;
      this.transitionToRoute('manage.alert.tune', this.get('alertId'), { queryParams: { duration, startDate, endDate }});
    },

    /**
     * Handle sorting for each sortable table column
     * @param {String} sortKey  - stringified start date
     */
    toggleSortDirection(sortKey) {
      const propName = 'sortColumn' + sortKey.capitalize() + 'Up' || '';

      this.toggleProperty(propName);
      if (this.get(propName)) {
        this.set('selectedSortMode', sortKey + ':up');
      } else {
        this.set('selectedSortMode', sortKey + ':down');
      }

      //On sort, set table to first pagination page
      this.set('currentPage', 1);
    }

  }
});
