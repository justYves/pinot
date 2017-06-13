/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      includePolyfill: true
    },

    fingerprint: {
      prepend: '/app/'
    },

    sassOptions: {
      extension: 'scss',
      // includePaths:[
      //   'bower_components/source-sans-pro'
      // ]
    },

    sourcemaps: {
      enabled: EmberApp.env() !== 'production',
      extensions: ['js', 'css']
    },

    babel: {
      sourceMaps: 'inline'
    },
  });
  
  app.import('bower_components/source-sans-pro/source-sans-pro.css');
  app.import(app.bowerDirectory + '/bootstrap/dist/css/bootstrap.css');

  const sourceSansProFontTree = new Funnel(app.bowerDirectory  + '/source-sans-pro', {
    srcDir: '/',
    include: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
    destDir: '/assets'
  });

  const bootstrapFontTree = new Funnel(app.bowerDirectory + '/bootstrap/dist/fonts/', {
    srcDir: '/',
    include: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
    destDir: 'fonts'
  })

  // Use `app.import` to add additional libraries to the generated
  // output files.
  
  // app.import('bower_components/source-sans-pro/source-sans-pro.css'), {
  //   type: 'vendor',
  //   prepend: true
  // };

  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  // return app.toTree();

  return app.toTree(new MergeTrees([sourceSansProFontTree, bootstrapFontTree]));
};
