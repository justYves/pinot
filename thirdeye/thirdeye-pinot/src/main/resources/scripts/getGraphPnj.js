var page = require('webpage').create();
var system = require('system');
var args = require('system').args;

page.viewportSize = {
  width: 480,
  height: 800
};


page.open('http://lva1-app0583.corp.linkedin.com:1426/thirdeye#anomalies?anomaliesSearchMode=id&pageNumber=1&anomalyIds=2828648', function(status) {
  system.stderr.writeLine('= onOpen()');
  system.stderr.writeLine(' PhantomJS version: ' + JSON.stringify(phantom.version));
  system.stderr.writeLine(' PhantomJS page settings: ' + JSON.stringify(page.settings));
  if (status !== 'success') {
   system.stderr.writeLine('Error opening url');
   phantom.exit(1);
  }
});

// recording navigation request
page.onNavigationRequested = function(url, type, willNavigate, main) {
  system.stderr.writeLine('= onNavigationRequested()');
  system.stderr.writeLine(' Trying to navigate to: ' + url);
  system.stderr.writeLine(' Caused by: ' + type);
  system.stderr.writeLine(' Will actually navigate: ' + willNavigate);
  system.stderr.writeLine(' Sent from the page\'s main frame: ' + main);
};
