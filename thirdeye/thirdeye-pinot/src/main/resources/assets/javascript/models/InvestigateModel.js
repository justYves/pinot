function InvestigateModel() {
  this.anomalyId;
  this.startDate = moment().subtract(1, 'days').startOf('day');
  this.endDate = moment().subtract(0, 'days').startOf('day');
  this.pageNumber = 1;
  this.functionName = '';
  this.granularity;
  this.dimension;
  this.filters;
  this.currentStart;
  this.currentEndl;
  this.baselineStart;
  this.baselineEnd;
  this.renderViewEvent = new Event();
}

InvestigateModel.prototype = {
  init: function ({ anomalyId }) {
    this.anomalyId = anomalyId;
    this.fetchMetricInformation();
  },

  update: function (params) {
    if (params.metricId) {
      this.metricId = params.metricId;
    }
  },

  fetchMetricInformation() {
    dataService.fetchAnomaliesForAnomalyIds(
          this.startDate, this.endDate, this.pageNumber, this.anomalyId, this.functionName, this.updateModelAndNotifyView.bind(this));
  },

  getAnomaliesWrapper : function() {
    return this.anomaliesWrapper;
  },

  updateModelAndNotifyView(anomaliesWrapper) {
    this.anomaliesWrapper = anomaliesWrapper;
    this.update(anomaliesWrapper.anomalyDetailsList[0]);
    this.formatAnomaly();
    this.renderViewEvent.notify();
  },
    /**
   * Helper Function that returns formatted anomaly region duration data for UI
   * @param  {date}   start   the anomaly region start
   * @param  {date}   end     the anomaly region end
   * @return {string}         formatted start - end date/time
   */
  getRegionDuration(start, end) {

    if (!(start && end)) {
      return 'N/A';
    }
    const regionStart = moment(start, constants.TIMESERIES_DATE_FORMAT);
    const regionEnd = moment(end, constants.TIMESERIES_DATE_FORMAT);
    const isSameDay = regionStart.isSame(regionEnd, 'day');
    const timeDelta = regionEnd.diff(regionStart);
    const regionDuration = moment.duration(timeDelta);
    let regionStartFormat;
    let regionEndFormat;

    if (isSameDay) {
      regionStartFormat = constants.DETAILS_DATE_DAYS_FORMAT;
      regionEndFormat = constants.DETAILS_DATE_HOURS_FORMAT;
    } else {
      regionStartFormat = regionEndFormat = constants.DETAILS_DATE_DAYS_FORMAT;
    }

    return `${regionDuration.humanize()} (${regionStart.format(regionStartFormat)} - ${regionEnd.format(regionEndFormat)})`;
  },

  /**
   * Helper Function that retuns formatted change delta for UI
   * @param  {int}    current    current average anomaly
   * @param  {int}    baseline   baseline the anomaly is compared too
   * @return {string}            'N/A' if either is missing, otherwise formatted delta (%)
   */
  getChangeDelta(current, baseline) {
    let changeDelta = 'N/A';
    if (current && baseline) {
      const amount = (current - baseline) / baseline * 100;
      changeDelta = `${amount.toFixed(2)}%`;
    }

    return changeDelta;
  },

  /**
   * Helper Function that sets formatted duration and changeDelta onto the anomaly model
   * @return {null}
   */
  formatAnomaly() {
    this.anomaliesWrapper.anomalyDetailsList.forEach((anomaly) => {
      anomaly.duration = this.getRegionDuration(anomaly.anomalyRegionStart, anomaly.anomalyRegionEnd);
      anomaly.changeDelta = this.getChangeDelta(anomaly.current, anomaly.baseline);
    });
  },
};
