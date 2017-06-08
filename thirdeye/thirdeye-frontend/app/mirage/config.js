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

  this.get('/anomalies/search/anomalyIds/1492498800000/1492585200000/1', (server) => {
    const anomaly = Object.assign({}, server.anomalies.first().attrs);
    const anomalyDetailsList = [ anomaly ];
    return { anomalyDetailsList };
  });

  this.get('/rootcause/queryRelatedMetrics', () => {
    return [{
      urn: "thirdeye:metric:4344011",
      score: 0.943,
      label: "traffic-top20-cc/L0proxy_query_volume_WoW:_Belgium_be",
      type: "Metric",
      link: "javascript:alert('thirdeye:metric:4344011');"
    }]
  });

  this.get('/data/anomalies/ranges', (server, request) => {
    const { metricIds, start, end, filters } = request.queryParams;

    const regions = metricIds
      .split(',')
      .reduce((regions, id) => {
        regions[id] = [];

        return regions;
      }, {})

    return regions;
  })



  this.get('/timeseries/compare/:id/:currentStart/:currentEnd/:baselineStart/:baselineEnd', () => {
    return {
metricName: "pageViews",
metricId: 4344011,
start: 1496174400000,
end: 1496246400000,
timeBucketsCurrent: [
1496174400000,
1496178000000,
1496181600000,
1496185200000,
1496188800000,
1496192400000,
1496196000000,
1496199600000,
1496203200000,
1496206800000,
1496210400000,
1496214000000,
1496217600000,
1496221200000,
1496224800000,
1496228400000,
1496232000000,
1496235600000,
1496239200000,
1496242800000,
1496246400000
],
timeBucketsBaseline: [
1495569600000,
1495573200000,
1495576800000,
1495580400000,
1495584000000,
1495587600000,
1495591200000,
1495594800000,
1495598400000,
1495602000000,
1495605600000,
1495609200000,
1495612800000,
1495616400000,
1495620000000,
1495623600000,
1495627200000,
1495630800000,
1495634400000,
1495638000000,
1495641600000
],
subDimensionContributionMap: {
All: {
currentValues: [
45946161,
39617872,
31311017,
26211662,
25246427,
26316689,
25708918,
23903606,
23320454,
25511193,
27135852,
28534780,
28785106,
29806862,
31663574,
35371854,
39172161,
43187916,
45704248,
47636156,
47300463
],
baselineValues: [
43156023,
36468952,
28891299,
24657286,
24083883,
25776156,
25330135,
23346391,
23064013,
25394829,
26987476,
28355620,
29070355,
29550051,
32508097,
36631587,
40733223,
44891207,
47269089,
46252080,
44261385
],
percentageChange: [
"6.47",
"8.63",
"8.38",
"6.3",
"4.83",
"2.1",
"1.5",
"2.39",
"1.11",
"0.46",
"0.55",
"0.63",
"-0.98",
"0.87",
"-2.6",
"-3.44",
"-3.83",
"-3.79",
"-3.31",
"2.99",
"6.87"
],
cumulativeCurrentValues: [
45946161,
85564033,
116875050,
143086712,
168333139,
194649828,
220358746,
244262352,
267582806,
293093999,
320229851,
348764631,
377549737,
407356599,
439020173,
474392027,
513564188,
556752104,
602456352,
650092508,
697392971
],
cumulativeBaselineValues: [
43156023,
79624975,
108516274,
133173560,
157257443,
183033599,
208363734,
231710125,
254774138,
280168967,
307156443,
335512063,
364582418,
394132469,
426640566,
463272153,
504005376,
548896583,
596165672,
642417752,
686679137
],
cumulativePercentageChange: [
"6.47",
"7.46",
"7.7",
"7.44",
"7.04",
"6.35",
"5.76",
"5.42",
"5.03",
"4.61",
"4.26",
"3.95",
"3.56",
"3.36",
"2.9",
"2.4",
"1.9",
"1.43",
"1.06",
"1.19",
"1.56"
]
}
}
}
    
  })
}
