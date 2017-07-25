import moment from 'moment';

export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  this.timing = 1000;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:`

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
  */

  /**
   * Mocks anomaly data end points
   */
  this.get('/anomalies/search/anomalyIds/1492498800000/1492585200000/1', (server) => {
    const anomaly = Object.assign({}, server.anomalies.first().attrs);
    const anomalyDetailsList = [ anomaly ];
    return { anomalyDetailsList };
  });

  /**
   * Mocks related Metric Id endpoints
   */
  this.get('/rootcause/queryRelatedMetrics', () => {
    return [{
      urn: "thirdeye:metric:1234",
      score: 0.955,
      label: "exampleMetric",
      type: "Metric"
    }];
  });

  /**
   * Mocks anomaly region endpoint
   */
  this.get('/data/anomalies/ranges', (server, request) => {
    const { metricIds, start, end } = request.queryParams;

    const regions = metricIds
      .split(',')
      .reduce((regions, id) => {
        regions[id] = [{
          start,
          end
        }];

        return regions;
      }, {});

    return regions;
  });

  /**
   * Mocks time series compare endpoints
   */
  this.get('/timeseries/compare/:id/:currentStart/:currentEnd/:baselineStart/:baselineEnd', (server, request) => {
    const { id, currentStart, currentEnd } = request.params;
    const interval = 3600000;
    const dataPoint = Math.floor((+currentEnd - currentStart) / interval);

    //TODO: mock data dynamically
    return {
      metricName: "example Metric",
      metricId: id,
      start: currentStart,
      end: currentEnd,

      timeBucketsCurrent: [...new Array(dataPoint)].map((point, index) => {
        return +currentStart + (index * interval);
      }),

      subDimensionContributionMap: {
        All: {
          currentValues: [...new Array(dataPoint)].map(() => {
            const num = Math.random() * 100;
            return num.toFixed(2);
          }),
          baselineValues: [...new Array(dataPoint)].map(() => {
            const num = Math.random() * 100;
            return num.toFixed(2);
          }),
          percentageChange: [...new Array(dataPoint)].map(() => {
            const num = (Math.random() * 200) - 100;
            return num.toFixed(2);
          })
        }
      }
    };
  });

  /**
   * Mocks data for metric granularity
   */
  this.get('data/agg/granularity/metric/:id', () => {
    return [
      'MINUTES',
      'HOURS',
      'DAYS'
    ];
  });

  /**
   * Mocks the metric's max time
   */

  this.get('/data/maxDataTime/**', () => {
    return moment().valueOf();
  });

  this.get('/data/autocomplete/filters/metric/:id', () => {
    return {
      browserName: ["chrome", "unknown", "mobile iphone", "firefox", "safari", "internet explorer", "mozilla", "iemobile"],
      continent: ["Europe", "Asia", "unknown", "Latin America", "North America", "Africa", "Middle East", "Oceania"],
      countryCode: ["OTHER", "us", "gb", "fr", "ca", "nl", "es", "de", "it", "in", "cn", "br", "ch", "se", "au", "tr"],
      deviceName: ["Desktop", "Android", "iPhone", "Tablet", "OTHER"],
      environment: ["prod-lor1", "prod-ltx1", "prod-lva1", "prod-lsg1", "", "PRODUCTION"],
      locale: ["en", "fr", "es", "OTHER", "de", "pt", "it", "nl", "zh", "ru", "tr", "sv", "da", "pl", "ko", "cs", ""],
      locale_topk: ["en", "fr", "es", "OTHER", "de", "pt", "it", "nl", "zh", "ru", "tr", "sv", "da", "pl", "ko", "cs", ""],
      osName: ["android", "iphone", "windows 7", "windows 10.0", "unknown", "macintosh", "windows 8.1", "ipad"],
      osName_topk: ["android", "iphone", "windows 7", "windows 10.0", "unknown", "macintosh", "windows 8.1", "ipad"],
      pageKey: ["d_flagship3_feed_updates", "d_flagship3_profile_view", "p_flagship3_feed_updates"],
      pageKey_topk: ["other", "d_flagship3_feed_updates", "d_flagship3_profile_view", "p_flagship3_feed_updates"],
      service: ["mobile-tracking-frontend", "uas-tomcat", "lighthouse-frontend", "nux-frontend", "cap-frontend"],
      service_topk: ["mobile-tracking-frontend", "uas-tomcat", "lighthouse-frontend", "nux-frontend", "cap-frontend"],
      sourceApp: ["", "voyager", "mobileweb", "titan"]
    };
  });

}

